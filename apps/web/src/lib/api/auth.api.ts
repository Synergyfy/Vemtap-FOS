import FOS_API from "./axios";
import type { LoginResponse } from "@/lib/types";

export const authApi = {
  login: async (identifier: string, password: string) => {
    return FOS_API.post("/auth/login", {
      identifier,
      password,
    }) as unknown as Promise<LoginResponse>;
  },
};
