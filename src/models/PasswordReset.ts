export interface PasswordReset {
  id: string;
  email: string;
  token: string;
  expiry: Date;
}