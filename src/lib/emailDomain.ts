export function getEmailDomain(email: string) {
  const atIndex = email.lastIndexOf('@');
  return atIndex < 0 ? '' : email.slice(atIndex + 1);
}
