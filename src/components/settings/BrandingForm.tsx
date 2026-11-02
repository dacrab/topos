"use client";

import { Droplets, Palette, Ruler } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { updateBranding } from "@/app/(dashboard)/settings/actions";
import { FormSubmitButton, Label } from "@/components/ui/form";
import { ImageUploadField } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/ui/page";
import { useFormAction } from "@/hooks/useFormAction";
import { useImageUpload } from "@/hooks/useImageUpload";
import { CSS_LENGTH, contrastRatio, HEX_COLOR } from "@/lib/css-validation";
import type { TenantBranding } from "@/lib/types";

const LIGHT_BACKGROUND = "#f8f7f4";
const DARK_BACKGROUND = "#0e100f";

const COLOR_FIELDS = ["primary", "darkPrimary", "accent", "darkAccent"] as const;
type ColorFieldName = (typeof COLOR_FIELDS)[number];

type ColorState = { value: string; error: boolean; preview: string | null };

const COLOR_FALLBACKS: Record<ColorFieldName, string> = {
  primary: "var(--primary)",
  accent: "var(--accent)",
  darkPrimary: DARK_BACKGROUND,
  darkAccent: DARK_BACKGROUND,
};

function ContrastPill({ ratio, t }: { ratio: number | null; t: (key: string) => string }) {
  if (ratio === null) return null;
  let cls = "border px-1.5 py-0.5 micro-caps";
  let label = "";
  if (ratio >= 4.5) {
    cls += " bg-success/10 text-success border-success/20";
    label = t("contrastPass");
  } else if (ratio >= 3) {
    cls += " bg-warning/10 text-warning border-warning/20";
    label = t("contrastLarge");
  } else {
    cls += " bg-destructive/10 text-destructive border-destructive/20";
    label = t("contrastFail");
  }
  return (
    <span className={cls} aria-live="polite">
      {label} · {ratio.toFixed(1)}:1
    </span>
  );
}

function ColorField({
  id,
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  ratio,
  fallback,
  t,
}: {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error: boolean;
  ratio?: number | null;
  fallback: string;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-3 items-center">
        <div
          className="h-10 w-10 shrink-0 border border-border"
          style={{
            background: HEX_COLOR.test(value.trim()) ? value.trim() : fallback,
          }}
        />
        <Input
          id={id}
          name={name}
          className="flex-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      {error && <p className="text-xs text-destructive">{t("invalidHex")}</p>}
      {ratio !== undefined && <ContrastPill ratio={ratio} t={t} />}
    </div>
  );
}

type BrandingFormProps = {
  tenant: {
    name: string;
    logoUrl: string | null;
    branding: TenantBranding;
  };
};

export function BrandingForm({ tenant }: BrandingFormProps) {
  const t = useTranslations("Branding");
  const logo = useImageUpload(tenant.logoUrl, "logo");
  const branding = tenant.branding;

  const [colors, setColors] = useState<Record<ColorFieldName, ColorState>>(() => {
    const toState = (value: string): ColorState => {
      const valid = value !== "" && HEX_COLOR.test(value);
      return { value, error: false, preview: valid ? value : null };
    };
    // Field-by-field rather than loop-built: the record stays exhaustive, so a
    // new colour in COLOR_FIELDS fails to compile instead of silently missing.
    return {
      primary: toState(branding.primary ?? ""),
      darkPrimary: toState(branding.darkPrimary ?? ""),
      accent: toState(branding.accent ?? ""),
      darkAccent: toState(branding.darkAccent ?? ""),
    };
  });

  const [radius, setRadius] = useState(branding.radius ?? "");
  const [radiusError, setRadiusError] = useState(false);
  const { isPending, run } = useFormAction();

  const setColor = (name: ColorFieldName, value: string) => {
    const trimmed = value.trim();
    setColors((prev) => ({
      ...prev,
      [name]: {
        value,
        error: trimmed !== "" && !HEX_COLOR.test(trimmed),
        preview: HEX_COLOR.test(trimmed) ? trimmed : prev[name].preview,
      },
    }));
  };

  const handleRadiusChange = (value: string) => {
    setRadius(value);
    const trimmed = value.trim();
    setRadiusError(trimmed !== "" && !CSS_LENGTH.test(trimmed));
  };

  const handleSubmit = run(updateBranding, {
    beforeSubmit: async (formData) => {
      const cleanupField = (name: string, regex: RegExp) => {
        const raw = formData.get(name)?.toString() ?? "";
        const trimmed = raw.trim();
        if (!(trimmed && regex.test(trimmed))) {
          formData.delete(name);
        }
      };

      cleanupField("primary", HEX_COLOR);
      cleanupField("darkPrimary", HEX_COLOR);
      cleanupField("accent", HEX_COLOR);
      cleanupField("darkAccent", HEX_COLOR);
      cleanupField("radius", CSS_LENGTH);

      const logoUrl = await logo.upload();
      formData.set("logoUrl", logoUrl);
    },
  });

  const ratio = (name: ColorFieldName): number | null => {
    const value = colors[name].value.trim();
    if (!HEX_COLOR.test(value)) return null;
    if (name === "darkPrimary") return contrastRatio(value, DARK_BACKGROUND);
    if (name === "primary") return contrastRatio(value, LIGHT_BACKGROUND);
    return null;
  };

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-6">
      <FormSection
        title={t("identity")}
        description={t("identityDesc")}
        icon={<Palette className="h-4 w-4" />}
      >
        <div className="space-y-2">
          <Label htmlFor="name">{t("agencyName")}</Label>
          <Input
            id="name"
            name="name"
            defaultValue={tenant.name}
            placeholder={t("agencyPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("logo")}</Label>
          <ImageUploadField
            image={logo}
            label={t("selectLogo")}
            hint={t("logoHint")}
            disabled={isPending}
          />
        </div>
      </FormSection>

      <FormSection
        title={t("colors")}
        description={t("colorsDesc")}
        icon={<Droplets className="h-4 w-4" />}
      >
        {COLOR_FIELDS.map((name) => (
          <ColorField
            key={name}
            id={name}
            label={t(`${name}Color`)}
            name={name}
            value={colors[name].value}
            onChange={(v) => setColor(name, v)}
            placeholder={t(`${name}Placeholder`)}
            error={colors[name].error}
            ratio={ratio(name)}
            fallback={colors[name].preview ?? COLOR_FALLBACKS[name]}
            t={t}
          />
        ))}
      </FormSection>

      <FormSection
        title={t("shape")}
        description={t("shapeDesc")}
        icon={<Ruler className="h-4 w-4" />}
      >
        <div className="space-y-2">
          <Label htmlFor="radius">{t("borderRadius")}</Label>
          <Input
            id="radius"
            name="radius"
            value={radius}
            onChange={(e) => handleRadiusChange(e.target.value)}
            placeholder={t("radiusPlaceholder")}
          />
          {radiusError && <p className="text-xs text-destructive">{t("invalidLength")}</p>}
          <p className="text-xs text-muted-foreground">{t("radiusHint")}</p>
        </div>
      </FormSection>

      <FormSubmitButton
        isPending={isPending}
        pendingLabel={t("saving")}
        idleLabel={t("saveChanges")}
      />
    </form>
  );
}
