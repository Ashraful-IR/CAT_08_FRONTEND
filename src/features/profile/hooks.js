import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateProfile } from "./api";

/**
 * PATCH /users/:email (roadmap 5.1). On success the backend returns the
 * updated user — write it straight into the ['session'] cache
 * (API_CONTRACT → Users: "update the ['session'] query cache") so the
 * navbar and greeting re-render without a refetch.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, ...values }) => updateProfile(email, values),
    onSuccess: (result) => {
      queryClient.setQueryData(["session"], (current) => ({
        ...(current ?? {}),
        user: result.user,
      }));
      toast.success("Profile updated");
    },
  });
}
