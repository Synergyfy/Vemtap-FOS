import api from "./axios";
import type { SettingsData, SettingsResponse, TeamResponse, TeamMember } from "@/lib/types";

export const settingsApi = {
  get: async () => {
    return api.get("/settings") as Promise<SettingsResponse>;
  },

  update: async (data: SettingsData) => {
    return api.put("/settings", data) as Promise<SettingsResponse>;
  },

  getTeam: async () => {
    return api.get("/settings/team") as Promise<TeamResponse>;
  },

  inviteMember: async (data: { email: string; name: string; role: string }) => {
    return api.post("/settings/team/invite", data) as Promise<TeamMember>;
  },

  removeMember: async (id: string) => {
    return api.delete(`/settings/team/${id}`) as Promise<{ message: string }>;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return api.post("/auth/change-password", data) as Promise<{ message: string }>;
  },
};
