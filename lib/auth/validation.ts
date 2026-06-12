export type SignUpInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthValidationResult =
  | { success: true }
  | { success: false; errors: string[] };

export const MIN_PASSWORD_LENGTH = 8;

export function isValidAuthEmail(email: string): boolean {
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    errors.push('Password must include at least one letter and one number.');
  }
  return errors;
}

export function validateSignUpInput(input: SignUpInput): AuthValidationResult {
  const errors: string[] = [];

  if (!input.firstName.trim()) errors.push('Enter your first name.');
  if (!input.lastName.trim()) errors.push('Enter your last name.');
  if (!isValidAuthEmail(input.email)) errors.push('Enter a valid email address.');
  errors.push(...validatePassword(input.password));
  if (input.password !== input.confirmPassword) errors.push('Passwords do not match.');

  return errors.length > 0 ? { success: false, errors } : { success: true };
}

export function validateLoginInput(email: string, password: string): AuthValidationResult {
  const errors: string[] = [];
  if (!isValidAuthEmail(email)) errors.push('Enter a valid email address.');
  if (!password) errors.push('Enter your password.');
  return errors.length > 0 ? { success: false, errors } : { success: true };
}
