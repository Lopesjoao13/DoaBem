export const canAccess = (allowedRoles, role) => !allowedRoles || allowedRoles.includes(role)
