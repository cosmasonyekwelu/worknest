import { useSearchParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { SearchIcon, X } from "lucide-react";
import { ADMIN_PAGE_SIZE } from "@/constants/pagination";

export default function Search({ id, children, minQueryLength = 4 }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef(null);
  const query = searchParams.get("query") || "";
  const [inputValue, setInputValue] = useState(query);
  const minLength =
    Number.isInteger(minQueryLength) && minQueryLength > 0 ? minQueryLength : 4;

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const debouncedSubmit = useDebouncedCallback((value) => {
    const params = new URLSearchParams(searchParams);
    const normalizedValue = value.trim();

    if (normalizedValue.length >= minLength) {
      params.set("query", normalizedValue);
    } else {
      params.delete("query");
    }

    params.set("page", "1");
    params.set("limit", String(ADMIN_PAGE_SIZE));
    setSearchParams(params);
  }, 500);

  return (
    <>
      <div className="flex justify-between items-center md:gap-2 w-full md:w-auto">
        <form role="search" id={id} className="relative flex-1">
          <label className="relative input w-full">
            <SearchIcon className="text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
            <input
              onChange={(event) => {
                const value = event.target.value;
                setInputValue(value);
                debouncedSubmit(value);
              }}
              type="search"
              className="w-full grow rounded-xl py-2 pl-9 pr-8"
              placeholder="Search Candidates...."
              name="query"
              aria-label="Search"
              value={inputValue}
              ref={inputRef}
            />
          </label>
          {query && (
            <X
              className="absolute top-[20%] right-2"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete("query");
                params.set("page", "1");
                params.set("limit", String(ADMIN_PAGE_SIZE));
                setSearchParams(params);
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
                setInputValue("");
              }}
            />
          )}
        </form>
        {children}
      </div>
    </>
  );
}
