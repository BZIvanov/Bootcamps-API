export const USER_MODEL_NAME = 'User';

export const userTypes = {
  USER: 'user',
  PUBLISHER: 'publisher',
  ADMIN: 'admin', // only by manually editing the database
} as const;

export type UserRole = (typeof userTypes)[keyof typeof userTypes];
