/**
 * Form validation helpers — migrated from original inline scripts
 */

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return emailRegex.test(value.trim());
}

export function isValidPhone(value) {
  return /^[\d\s+\-()]{10,}$/.test(value.trim());
}

export function isValidUsername(value) {
  return /^[a-zA-Z0-9_]+$/.test(value.trim());
}

/**
 * Password strength scorer
 * @returns {'weak'|'medium'|'strong'|''} strength label
 */
export function getPasswordStrength(password) {
  if (!password) return '';
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return 'weak';
  if (score === 2) return 'medium';
  return 'strong';
}
