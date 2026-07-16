export const USER_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  STAFF: 'staff',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const USER_ROLE_LIST: readonly UserRole[] = [
  USER_ROLES.OWNER,
  USER_ROLES.MANAGER,
  USER_ROLES.STAFF,
]

export const MANAGER_ROLES: readonly UserRole[] = [
  USER_ROLES.OWNER,
  USER_ROLES.MANAGER,
]

export function isManagerOrAbove(role: UserRole | null | undefined): boolean {
  return role === USER_ROLES.OWNER || role === USER_ROLES.MANAGER
}

export function isOwner(role: UserRole | null | undefined): boolean {
  return role === USER_ROLES.OWNER
}
