"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateCompany } from "@/app/(dashboard)/settings/actions";

type TenantBranding = {
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  description?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
};

type CompanyFormProps = {
  tenant: {
    id: string;
    name: string;
    slug: string;
    customDomain: string | null;
    createdAt: Date;
    branding: TenantBranding | null;
  };
};

export function CompanyForm({ tenant }: CompanyFormProps) {
  const [isPending, startTransition] = useTransition();
  const branding = tenant.branding || {};

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateCompany(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-8 max-w-xl">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          Basic Information
        </h3>

        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            Company Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
            defaultValue={tenant.name}
            placeholder="Acme Real Estate"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="slug"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            Subdomain
          </label>
          <div className="flex items-center">
            <input
              id="slug"
              name="slug"
              type="text"
              className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              defaultValue={tenant.slug}
              placeholder="acme"
            />
            <span className="ml-2 text-sm text-muted-foreground whitespace-nowrap">
              .aether.com
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="customDomain"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            Custom Domain
          </label>
          <input
            id="customDomain"
            name="customDomain"
            type="text"
            className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
            defaultValue={tenant.customDomain ?? ""}
            placeholder="www.acmerealestate.com"
          />
          <p className="text-xs text-muted-foreground">
            Point your domain&apos;s CNAME to aether.com to use a custom domain
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            Company Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm resize-none"
            defaultValue={branding.description ?? ""}
            placeholder="Tell visitors about your company..."
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          Contact Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              defaultValue={branding.phone ?? ""}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="companyEmail"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Email
            </label>
            <input
              id="companyEmail"
              name="companyEmail"
              type="email"
              className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              defaultValue={branding.email ?? ""}
              placeholder="contact@company.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="website"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
            defaultValue={branding.website ?? ""}
            placeholder="https://www.company.com"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="address"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            Address
          </label>
          <textarea
            id="address"
            name="address"
            rows={2}
            className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm resize-none"
            defaultValue={branding.address ?? ""}
            placeholder="123 Main St, City, State 12345"
          />
        </div>
      </div>

      {/* Social Media */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          Social Media
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="socialFacebook"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Facebook
            </label>
            <input
              id="socialFacebook"
              name="socialFacebook"
              type="url"
              className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              defaultValue={branding.socialFacebook ?? ""}
              placeholder="https://facebook.com/..."
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="socialInstagram"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Instagram
            </label>
            <input
              id="socialInstagram"
              name="socialInstagram"
              type="url"
              className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              defaultValue={branding.socialInstagram ?? ""}
              placeholder="https://instagram.com/..."
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="socialTwitter"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Twitter / X
            </label>
            <input
              id="socialTwitter"
              name="socialTwitter"
              type="url"
              className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              defaultValue={branding.socialTwitter ?? ""}
              placeholder="https://twitter.com/..."
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="socialLinkedin"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              LinkedIn
            </label>
            <input
              id="socialLinkedin"
              name="socialLinkedin"
              type="url"
              className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              defaultValue={branding.socialLinkedin ?? ""}
              placeholder="https://linkedin.com/company/..."
            />
          </div>
        </div>
      </div>

      {/* Tenant Info */}
      <div className="border border-border p-4 space-y-3 bg-secondary/30">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Tenant Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Tenant ID</span>
            <p className="font-mono text-xs truncate">{tenant.id}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Created</span>
            <p className="font-mono">{tenant.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-primary-foreground px-6 py-3 font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
