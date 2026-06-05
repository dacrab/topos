import { describe, expect, it } from "vitest";
import {
  changePlanSchema,
  createListingSchema,
  inviteTeamMemberSchema,
  onboardingSchema,
  updateBrandingSchema,
  updateCompanySchema,
  updateMemberRoleSchema,
  updateProfileSchema,
} from "@/lib/validation";

describe("createListingSchema", () => {
  it("accepts minimal valid data", () => {
    const data = createListingSchema.parse({ title: "Test", price: 100000 });
    expect(data.title).toBe("Test");
    expect(data.price).toBe(100000);
    expect(data.status).toBe("DRAFT");
    expect(data.images).toEqual([]);
  });

  it("rejects missing title", () => {
    expect(() => createListingSchema.parse({ price: 100000 })).toThrow("Title is required");
  });

  it("rejects empty title", () => {
    expect(() => createListingSchema.parse({ title: "", price: 100000 })).toThrow(
      "Title is required",
    );
  });

  it("rejects negative price", () => {
    expect(() => createListingSchema.parse({ title: "Test", price: -1 })).toThrow(
      "Price must be positive",
    );
  });

  it("rejects zero price", () => {
    expect(() => createListingSchema.parse({ title: "Test", price: 0 })).toThrow(
      "Price must be positive",
    );
  });

  it("accepts valid features", () => {
    const data = createListingSchema.parse({
      title: "Test",
      price: 100,
      features: { beds: 3, baths: 2, sqft: 1500, yearBuilt: 2020 },
    });
    expect(data.features.beds).toBe(3);
    expect(data.features.yearBuilt).toBe(2020);
  });

  it("rejects negative beds", () => {
    expect(() =>
      createListingSchema.parse({
        title: "Test",
        price: 100,
        features: { beds: -1 },
      }),
    ).toThrow();
  });

  it("accepts valid status", () => {
    const data = createListingSchema.parse({
      title: "Test",
      price: 100,
      status: "PUBLISHED",
    });
    expect(data.status).toBe("PUBLISHED");
  });

  it("rejects invalid status", () => {
    expect(() =>
      createListingSchema.parse({
        title: "Test",
        price: 100,
        status: "INVALID",
      }),
    ).toThrow();
  });
});

describe("updateProfileSchema", () => {
  it("accepts valid profile", () => {
    const data = updateProfileSchema.parse({ name: "John" });
    expect(data.name).toBe("John");
  });

  it("rejects empty name", () => {
    expect(() => updateProfileSchema.parse({ name: "" })).toThrow("Name is required");
  });

  it("accepts null image", () => {
    const data = updateProfileSchema.parse({ name: "John", image: null });
    expect(data.image).toBeNull();
  });
});

describe("inviteTeamMemberSchema", () => {
  it("accepts valid email and role", () => {
    const data = inviteTeamMemberSchema.parse({ email: "test@example.com", role: "agent" });
    expect(data.email).toBe("test@example.com");
    expect(data.role).toBe("agent");
  });

  it("defaults role to agent", () => {
    const data = inviteTeamMemberSchema.parse({ email: "test@example.com" });
    expect(data.role).toBe("agent");
  });

  it("rejects invalid email", () => {
    expect(() => inviteTeamMemberSchema.parse({ email: "not-email" })).toThrow();
  });

  it("rejects invalid role", () => {
    expect(() =>
      inviteTeamMemberSchema.parse({ email: "test@example.com", role: "superadmin" }),
    ).toThrow();
  });
});

describe("updateMemberRoleSchema", () => {
  it("accepts valid member update", () => {
    const data = updateMemberRoleSchema.parse({
      memberId: "550e8400-e29b-41d4-a716-446655440000",
      role: "admin",
    });
    expect(data.role).toBe("admin");
  });

  it("rejects non-uuid memberId", () => {
    expect(() => updateMemberRoleSchema.parse({ memberId: "not-a-uuid", role: "agent" })).toThrow();
  });
});

describe("updateCompanySchema", () => {
  it("accepts minimal company data", () => {
    const data = updateCompanySchema.parse({});
    expect(data).toBeDefined();
  });

  it("accepts valid slug", () => {
    const data = updateCompanySchema.parse({ slug: "my-company" });
    expect(data.slug).toBe("my-company");
  });

  it("rejects invalid slug", () => {
    expect(() => updateCompanySchema.parse({ slug: "UPPERCASE" })).toThrow();
  });

  it("validates email format", () => {
    expect(() => updateCompanySchema.parse({ companyEmail: "bad" })).toThrow();
  });

  it("accepts empty email", () => {
    const data = updateCompanySchema.parse({ companyEmail: "" });
    expect(data.companyEmail).toBe("");
  });
});

describe("updateBrandingSchema", () => {
  it("accepts empty branding", () => {
    const data = updateBrandingSchema.parse({});
    expect(data).toBeDefined();
  });

  it("accepts valid color values", () => {
    const data = updateBrandingSchema.parse({ primary: "#000000", accent: "#ffffff" });
    expect(data.primary).toBe("#000000");
    expect(data.accent).toBe("#ffffff");
  });

  it("rejects invalid logo URL", () => {
    expect(() => updateBrandingSchema.parse({ logoUrl: "not-a-url" })).toThrow();
  });

  it("accepts empty logo URL", () => {
    const data = updateBrandingSchema.parse({ logoUrl: "" });
    expect(data.logoUrl).toBe("");
  });
});

describe("onboardingSchema", () => {
  it("accepts valid onboarding data", () => {
    const data = onboardingSchema.parse({ agencyName: "My Agency", slug: "my-agency" });
    expect(data.agencyName).toBe("My Agency");
    expect(data.slug).toBe("my-agency");
  });

  it("rejects empty agency name", () => {
    expect(() => onboardingSchema.parse({ slug: "my-agency" })).toThrow("Agency name is required");
  });

  it("rejects invalid slug", () => {
    expect(() => onboardingSchema.parse({ agencyName: "A", slug: "INVALID" })).toThrow();
  });
});

describe("changePlanSchema", () => {
  it("accepts valid plan", () => {
    const data = changePlanSchema.parse({ plan: "pro" });
    expect(data.plan).toBe("pro");
  });

  it("rejects invalid plan", () => {
    expect(() => changePlanSchema.parse({ plan: "nonexistent" })).toThrow();
  });
});
