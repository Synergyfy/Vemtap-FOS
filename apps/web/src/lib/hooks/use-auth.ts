import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth.api";

export function useLogin() {
  return useMutation({
    mutationFn: ({ identifier, password }: { identifier: string; password: string }) =>
      authApi.login(identifier, password),
  });
}
