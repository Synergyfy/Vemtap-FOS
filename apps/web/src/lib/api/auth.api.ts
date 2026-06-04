import FOS_API from "./axios";
import type { LoginResponse } from "@/lib/types";

export const authApi = {
  login: async (identifier: string, password: string) => {
    return FOS_API.post<LoginResponse>("/auth/login", {
      identifier,
      password,
    }) as Promise<LoginResponse>;
  },
};
