export type PermissionsType = typeof PERMISSION_TYPES[keyof typeof PERMISSION_TYPES];

type RolePermissions = {
  ADMIN: PermissionsType[],
  FACILITY_STAFF: PermissionsType[]
}

export const PERMISSION_TYPES = {
  REGISTER_FACILITY: "REGISTER_FACILITY",
  PATCH_FACILITY: "PATCH_FACILITY",

  REGISTER_STAFF_ACC: "REGISTER_STAFF_ACC",
} as  const

export const ROLE_PERMISSIONS: RolePermissions = {
  ADMIN: Object.values(PERMISSION_TYPES), // MEANS ADMIN HAS ALL THE PERMISSIONS
  FACILITY_STAFF: [
    PERMISSION_TYPES.PATCH_FACILITY
  ],
} as RolePermissions