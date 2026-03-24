import { useQuery } from "@tanstack/react-query";
import { getAllJobs } from "@/api/api";
import { useAuth } from "@/store";
import { ADMIN_PAGE_SIZE } from "@/constants/pagination";

const SALARY_LABEL_TO_RANGE = {
  "₦300k - ₦380k": { min: 300000, max: 380000 },
  "₦250k - ₦350k": { min: 250000, max: 350000 },
  "₦200k - ₦250k": { min: 200000, max: 250000 },
  "₦150k - ₦250k": { min: 150000, max: 250000 },
  "₦100k - ₦150k": { min: 100000, max: 150000 },
};

const parsePositiveNumber = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : null;
};

const parsePositiveInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
};

const normalizeSalaryRange = (salaryRange) => {
  if (!salaryRange) {
    return { min: null, max: null };
  }

  if (Array.isArray(salaryRange)) {
    const [firstRange] = salaryRange;
    if (!firstRange) {
      return { min: null, max: null };
    }

    if (typeof firstRange === "object") {
      return {
        min: parsePositiveNumber(firstRange.min),
        max: parsePositiveNumber(firstRange.max),
      };
    }

    const mappedRange = SALARY_LABEL_TO_RANGE[firstRange];
    if (mappedRange) {
      return mappedRange;
    }
  }

  if (typeof salaryRange === "object") {
    return {
      min: parsePositiveNumber(salaryRange.min),
      max: parsePositiveNumber(salaryRange.max),
    };
  }

  if (typeof salaryRange === "string") {
    const mappedRange = SALARY_LABEL_TO_RANGE[salaryRange];
    if (mappedRange) {
      return mappedRange;
    }
  }

  return { min: null, max: null };
};

const parsePositiveQueryNumber = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null;
};

const buildKeyword = (keywordOrSearch = "") => {
  const normalizedKeyword =
    typeof keywordOrSearch === "string" ? keywordOrSearch.trim() : "";
  return normalizedKeyword;
};

const buildPublicJobsParams = ({
  page,
  limit,
  keyword,
  category,
  jobType,
  salaryMin,
  salaryMax,
}) => {
  const params = { page, limit };

  if (keyword) {
    params.keyword = keyword;
  }
  if (category) {
    params.category = category;
  }
  if (jobType) {
    params.jobType = jobType;
  }

  const normalizedSalaryMin = parsePositiveQueryNumber(salaryMin);
  const normalizedSalaryMax = parsePositiveQueryNumber(salaryMax);

  if (normalizedSalaryMin !== null) {
    params.salaryMin = normalizedSalaryMin;
  }
  if (normalizedSalaryMax !== null) {
    params.salaryMax = normalizedSalaryMax;
  }

  return params;
};

const extractPublicJobsItems = (responseBody) => {
  if (Array.isArray(responseBody?.data?.data)) {
    return responseBody.data.data;
  }
  return null;
};

export function useJobs(filters = {}) {
  const { accessToken } = useAuth();
  const queryPage = parsePositiveInteger(filters?.page, 1);
  const queryLimit = Math.min(parsePositiveInteger(filters?.limit, 10), 50);

  return useQuery({
    queryKey: ["jobs", { page: queryPage, limit: queryLimit, filters }],
    queryFn: async () => {
      const {
        keyword = "",
        search = "",
        category = [],
        industry = [],
        jobType = [],
        salaryRange = null,
        salaryMin,
        salaryMax,
        page = 1,
        limit = 10,
      } = filters;

      const normalizedPage = parsePositiveInteger(page, 1);
      const normalizedLimit = Math.min(parsePositiveInteger(limit, 10), 50);

      const normalizedKeyword =
        (typeof keyword === "string" && keyword.trim()) ||
        (typeof search === "string" && search.trim()) ||
        "";
      const mergedKeyword = buildKeyword(normalizedKeyword);

      const categoryValues = Array.isArray(category)
        ? category
        : category
        ? [category]
        : Array.isArray(industry)
        ? industry
        : industry
        ? [industry]
        : [];
      const selectedCategory = categoryValues[0] || "";
      // TODO: Backend searchJobService currently accepts a single category string.
      const selectedJobType = Array.isArray(jobType)
        ? jobType[0] || ""
        : jobType || "";
      // TODO: Backend searchJobService currently accepts a single jobType string.

      const parsedSalaryRange = normalizeSalaryRange(salaryRange);
      const selectedSalaryMin =
        parsePositiveNumber(salaryMin) ?? parsedSalaryRange.min;
      const selectedSalaryMax =
        parsePositiveNumber(salaryMax) ?? parsedSalaryRange.max;
      const queryParams = buildPublicJobsParams({
        page: normalizedPage,
        limit: normalizedLimit,
        keyword: mergedKeyword,
        category: selectedCategory,
        jobType: selectedJobType,
        salaryMin: selectedSalaryMin,
        salaryMax: selectedSalaryMax,
      });

      try {
        const response = await getAllJobs(queryParams, accessToken);
        const responseBody = response?.data;
        const items = extractPublicJobsItems(responseBody);

        if (!Array.isArray(items)) {
          console.warn("Unexpected jobs response shape", responseBody);
          return {
            items: [],
            data: [],
            total: 0,
            totalPages: 1,
            page: normalizedPage,
            limit: normalizedLimit,
          };
        }

        const totalJobs = parseNumericMeta(responseBody?.data?.totalJobs);
        const resolvedTotal = totalJobs ?? items.length;

        const totalPages = parseNumericMeta(responseBody?.data?.totalPages);
        const resolvedTotalPages =
          totalPages ?? Math.max(1, Math.ceil(resolvedTotal / normalizedLimit));

        const responsePage = parsePositiveInteger(
          responseBody?.data?.page ?? responseBody?.page,
          normalizedPage
        );

        return {
          items,
          data: items,
          total: resolvedTotal,
          totalPages: Math.max(1, resolvedTotalPages),
          page: responsePage,
          limit: normalizedLimit,
        };
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        throw error;
      }
    },
    keepPreviousData: true,
  });
}

const parseNumericMeta = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") {
      continue;
    }
    const parsedValue = Number(value);
    if (Number.isFinite(parsedValue) && parsedValue >= 0) {
      return parsedValue;
    }
  }
  return null;
};

const extractAdminJobsPayload = (responseBody) => {
  const rawData = responseBody?.data || {};
  const items = Array.isArray(rawData?.data) ? rawData.data : [];
  return { rawData, items };
};

export function useAdminJobs(params = {}) {
  const { accessToken } = useAuth();
  const {
    page = 1,
    status = "",
    search = "",
    limit = ADMIN_PAGE_SIZE,
  } = params;
  const normalizedLimit = Math.min(
    parsePositiveInteger(limit, ADMIN_PAGE_SIZE),
    50
  );

  return useQuery({
    queryKey: ["admin-jobs", { page, limit: normalizedLimit, status, search }],
    queryFn: async () => {
      try {
        const queryParams = {
          page,
          limit: normalizedLimit,
        };

        if (status) {
          queryParams.status = status;
        }

        if (search) {
          queryParams.keyword = search;
        }

        const response = await getAllJobs(queryParams, accessToken);
        const body = response?.data;
        const { rawData, items } = extractAdminJobsPayload(body);

        const total = parseNumericMeta(
          rawData?.total,
          rawData?.totalJobs,
          rawData?.pagination?.total,
          body?.data?.total,
          body?.data?.totalJobs
        );

        let totalPages = parseNumericMeta(
          rawData?.totalPages,
          rawData?.pagination?.totalPages,
          body?.data?.totalPages
        );

        if (totalPages === null && total !== null && normalizedLimit > 0) {
          totalPages = Math.max(1, Math.ceil(total / normalizedLimit));
        }

        if (totalPages === null) {
          // Weak fallback when backend omits pagination metadata.
          totalPages = items.length === normalizedLimit ? page + 1 : page;
        }

        return {
          items,
          data: items,
          total:
            total !== null
              ? total
              : Math.max((page - 1) * normalizedLimit + items.length, 0),
          totalPages: Math.max(1, totalPages),
          page,
          limit: normalizedLimit,
        };
      } catch (error) {
        console.error("Failed to fetch admin jobs:", error);
        throw error;
      }
    },
    enabled: !!accessToken,
    placeholderData: (previousData) => previousData,
  });
}
