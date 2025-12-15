import { useMutation } from "@tanstack/react-query";

export const useMutationHooks = (fnCallback) => {
  return useMutation({
    mutationFn: (params) => fnCallback(params), // chỉ truyền nguyên params
  });
};
