import { ArrowUp } from "lucide-react";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

type SitePlanProps = {
  caption?: string;
  className?: string;
};

/**
 * A cadastral plate: survey grid, parcel boundary, the T footprint from the
 * mark, and one oxide-red survey point. It is the brand's idea of a place —
 * a site on paper — rather than a generic illustration.
 */
export function SitePlan({ caption, className }: SitePlanProps) {
  const grid = Array.from({ length: 7 }, (_, i) => (i + 1) * 50);

  return (
    <figure className={cn("border border-border bg-card", className)}>
      <div className="relative aspect-square">
        <svg viewBox="0 0 400 400" fill="none" aria-hidden="true" className="h-full w-full">
          <g stroke="var(--border)" strokeWidth="0.6" opacity="0.55">
            {grid.map((value) => (
              <Fragment key={value}>
                <line x1={value} y1="0" x2={value} y2="400" />
                <line x1="0" y1={value} x2="400" y2={value} />
              </Fragment>
            ))}
          </g>

          <g stroke="var(--accent)" strokeWidth="0.9" opacity="0.14">
            <path d="M-20 120 C 60 90 130 160 210 130 S 340 95 420 140" />
            <path d="M-20 200 C 60 170 130 240 210 210 S 340 175 420 220" />
            <path d="M-20 280 C 60 250 130 320 210 290 S 340 255 420 300" />
          </g>

          <polygon
            points="60,85 315,60 348,285 275,342 100,318 52,190"
            fill="var(--background)"
            fillOpacity="0.72"
            stroke="var(--foreground)"
            strokeWidth="1.5"
            strokeLinejoin="miter"
          />

          <path d="M140 112H262V152H217V282H187V152H140Z" fill="var(--foreground)" />

          <g stroke="var(--accent)" strokeWidth="0.8" opacity="0.55">
            <line x1="300" y1="278" x2="300" y2="314" />
            <line x1="282" y1="296" x2="318" y2="296" />
          </g>
          <rect x="294" y="290" width="12" height="12" fill="var(--accent)" />

          <text
            x="78"
            y="120"
            fill="var(--muted-foreground)"
            fontFamily="var(--font-mono)"
            fontSize="9"
            letterSpacing="1.5"
          >
            PLOT 07
          </text>
        </svg>

        <span className="absolute left-4 top-4 micro-caps text-muted-foreground">Fig. 01</span>
        <span className="absolute right-4 top-4 flex items-center gap-1 micro-caps text-muted-foreground">
          N
          <ArrowUp className="h-3 w-3" aria-hidden />
        </span>
      </div>

      {caption && (
        <figcaption className="flex items-center justify-between gap-4 border-t border-border px-4 py-3 meta-caps text-muted-foreground">
          <span className="truncate">{caption}</span>
          <span className="flex shrink-0 items-center gap-1.5">
            <span aria-hidden className="h-1 w-1 bg-accent" />
            Topos
          </span>
        </figcaption>
      )}
    </figure>
  );
}
