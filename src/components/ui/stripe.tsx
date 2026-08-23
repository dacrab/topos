import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "gradient" | "gradientAccent";
type Intensity = "subtle" | "soft" | "solid";

type CardStripeProps = {
  tone?: Tone;
  intensity?: Intensity;
  /** Slim variant for compact cards. */
  thin?: boolean;
  className?: string;
};

const TONES: Partial<Record<Tone, Record<Intensity, string>>> = {
  primary: {
    subtle: "bg-primary/5",
    soft: "bg-primary/10",
    solid: "bg-primary",
  },
  accent: {
    subtle: "bg-accent/5",
    soft: "bg-accent/10",
    solid: "bg-accent",
  },
};

/**
 * Decorative strip used at the top of cards, dialogs, and forms.
 * Solid tones via tone+intensity; gradient washes via the gradient tones.
 */
export function CardStripe({
  tone = "primary",
  intensity = "soft",
  thin = false,
  className,
}: CardStripeProps) {
  const color =
    tone === "gradient"
      ? "bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20"
      : tone === "gradientAccent"
        ? "bg-gradient-to-r from-accent via-primary to-brand"
        : (TONES[tone]?.[intensity] ?? TONES.primary?.soft);

  return <div aria-hidden className={cn("shrink-0", thin ? "h-1" : "h-1.5", color, className)} />;
}
