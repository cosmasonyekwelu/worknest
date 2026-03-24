import { useEffect } from "react";

export default function useSearch({
  inputRef,
  searchParams,
  setSearchParams,
  navigate,
  query,
}) {
  useEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement) return;

    const value = inputElement.value.trim();
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("query", value);
      navigate(`?${params.toString()}`, { replace: true });
    } else {
      params.delete("query");
      navigate("", { replace: true });
    }

    setSearchParams(params);
  }, [query, navigate, searchParams, setSearchParams, inputRef]);
}
