import uploadAccessConfig from '../../data/upload-allowed-users.json';

type UploadAccessConfig = {
  allowedDomains?: string[];
  allowedEmails?: string[];
};

export type UploadAccessResult = {
  isSchoolEmail: boolean;
  isAllowedUploader: boolean;
  normalizedEmail: string;
};

const config = (uploadAccessConfig ?? {}) as UploadAccessConfig;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getAllowedDomains() {
  return (config.allowedDomains ?? []).map((domain) => domain.trim().toLowerCase()).filter(Boolean);
}

export function getAllowedEmails() {
  return (config.allowedEmails ?? []).map(normalizeEmail).filter(Boolean);
}

export function getEmailDomain(email: string) {
  const atIndex = email.lastIndexOf('@');

  if (atIndex === -1) {
    return '';
  }

  return email.slice(atIndex + 1);
}

export function getUploadAccess(email: string | null | undefined): UploadAccessResult {
  const normalizedEmail = normalizeEmail(email ?? '');
  const domain = getEmailDomain(normalizedEmail);
  const isSchoolEmail = Boolean(domain) && getAllowedDomains().includes(domain);
  const isAllowedUploader = isSchoolEmail && getAllowedEmails().includes(normalizedEmail);

  return {
    isSchoolEmail,
    isAllowedUploader,
    normalizedEmail,
  };
}
