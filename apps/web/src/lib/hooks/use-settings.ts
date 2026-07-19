import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api/settings.api";

export const settingsKeys = {
  all: ["settings"] as const,
  team: ["settings", "team"] as const,
};

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: () => settingsApi.get(),
    staleTime: 60_000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.all }),
  });
}

export function useTeam() {
  return useQuery({
    queryKey: settingsKeys.team,
    queryFn: () => settingsApi.getTeam(),
    staleTime: 60_000,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.inviteMember,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.team }),
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsApi.removeMember(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.team }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: settingsApi.changePassword,
  });
}
