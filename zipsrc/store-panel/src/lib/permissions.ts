import type { Role } from "@prisma/client";

export type Action =
  | "product:view"
  | "product:create"
  | "product:edit"
  | "product:status"
  | "product:delete";

const rolePermissions: Record<Role, Action[]> = {
  ADMIN: ["product:view", "product:create", "product:edit", "product:status", "product:delete"],
  MANAGER: ["product:view", "product:create", "product:edit", "product:status"],
};

export function can(role: Role, action: Action) {
  return rolePermissions[role].includes(action);
}
