import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/components/ui/toast";
import { APIResponse, TokenResponse, User } from "@/types/auth";
import {
  ForgotPasswordFormData,
  LoginFormData,
  ResetPasswordFormData,
  SignupFormData,
} from "@/validators/auth";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuth, logout: storeLogout } = useAuthStore();
  const { showToast } = useToast();

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiClient.post<APIResponse<TokenResponse>>(
        "/auth/login",
        {
          email: data.email,
          password: data.password,
        }
      );
      return response.data;
    },
    onSuccess: (res) => {
      if (res.data) {
        setAuth(res.data.user, res.data.access_token, res.data.refresh_token);
        showToast("Logged in successfully", "success");
        router.push("/operations");
      }
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || "Invalid email or password";
      showToast(msg, "error");
    },
  });

  // Signup Mutation
  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const response = await apiClient.post<APIResponse<TokenResponse>>(
        "/auth/signup",
        data
      );
      return response.data;
    },
    onSuccess: (res) => {
      if (res.data) {
        setAuth(res.data.user, res.data.access_token, res.data.refresh_token);
        showToast("Account created successfully!", "success");
        router.push("/operations");
      }
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || "Registration failed. Please try again.";
      showToast(msg, "error");
    },
  });

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refresh_token: refreshToken });
      }
    },
    onSettled: () => {
      storeLogout();
      queryClient.clear();
      showToast("Logged out successfully", "info");
      router.push("/login");
    },
  });

  // Forgot Password Mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const response = await apiClient.post<APIResponse<{ reset_token: string }>>(
        "/auth/forgot-password",
        data
      );
      return response.data;
    },
    onSuccess: (res) => {
      showToast("Password reset token generated", "success");
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || "Request failed. Please try again.";
      showToast(msg, "error");
    },
  });

  // Reset Password Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      const response = await apiClient.post<APIResponse<null>>(
        "/auth/reset-password",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      showToast("Password reset successfully! Please log in.", "success");
      router.push("/login");
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || "Password reset failed.";
      showToast(msg, "error");
    },
  });

  // Fetch Current User Profile Query
  const useProfileQuery = () =>
    useQuery<User>({
      queryKey: ["auth", "me"],
      queryFn: async () => {
        const response = await apiClient.get<APIResponse<User>>("/auth/me");
        return response.data.data!;
      },
      enabled: useAuthStore((state) => state.isAuthenticated),
    });

  // Delete Account Mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete("/auth/account");
    },
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
      showToast("Your account has been deactivated and deleted.", "info");
      router.push("/signup");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to delete account.";
      showToast(msg, "error");
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    signup: signupMutation.mutate,
    isSigningUp: signupMutation.isPending,
    logout: logoutMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    isRequestingReset: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutate,
    isResettingPassword: resetPasswordMutation.isPending,
    deleteAccount: deleteAccountMutation.mutate,
    isDeletingAccount: deleteAccountMutation.isPending,
    useProfileQuery,
  };
}
