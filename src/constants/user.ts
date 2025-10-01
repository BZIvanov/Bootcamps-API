export const userTypes = {
  USER: 'user',
  PUBLISHER: 'publisher',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof userTypes)[keyof typeof userTypes];
