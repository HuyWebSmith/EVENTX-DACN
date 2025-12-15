// File: src/hooks/useQueryHooks.js
import { useQuery } from "@tanstack/react-query";

export const useQueryHooks = (queryKey, fnCallback, options = {}) => {
  return useQuery({
    queryKey: queryKey,
    queryFn: fnCallback,
    ...options,
  });
};
