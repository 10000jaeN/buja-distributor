export function isAdminRole(roles?: unknown): boolean {
  if (!roles) return false;
  if (Array.isArray(roles)) return (roles as string[]).includes("admin");
  return roles === "admin";
}
