export type ActionResult = { success: boolean; message?: string };

export type TenantBranding = {
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  description?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  primary?: string;
  accent?: string;
  radius?: string;
  [key: string]: unknown;
};
