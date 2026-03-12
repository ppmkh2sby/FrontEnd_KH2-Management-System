import type { AuthMeResponse, LoginResponse } from "@/shared/types/auth";

type AuthStateSource = Pick<
  LoginResponse | AuthMeResponse,
  "mustChangePassword" | "email" | "emailConfirmed"
>;

export function getPostLoginRoute(source: AuthStateSource): string {
  if (source.mustChangePassword) {
    return "/change-password";
  }

  if (!source.email) {
    return "/set-email";
  }

  if (!source.emailConfirmed) {
    return "/verify-email";
  }

  return "/";
}