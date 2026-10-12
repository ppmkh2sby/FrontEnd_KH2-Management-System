import type { AuthMeResponse, LoginResponse } from "@/shared/types/auth";

type AuthStateSource = Pick<
  LoginResponse | AuthMeResponse,
  "mustChangePassword"
>;

export function getPostLoginRoute(source: AuthStateSource): string {
  if (source.mustChangePassword) {
    return "/change-password";
  }

  return "/dashboard";
}
