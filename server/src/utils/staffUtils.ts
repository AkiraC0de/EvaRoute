export const toStaffDTO = (user: {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  isActive: boolean
  isSetupDone: boolean
  createdAt: Date
  facilityStaff: { facility: { id: string; name: string } } | null
}) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  isActive: user.isActive,
  isSetupDone: user.isSetupDone,
  createdAt: user.createdAt,
  facility: user.facilityStaff
    ? { id: user.facilityStaff.facility.id, name: user.facilityStaff.facility.name }
    : null,
})
