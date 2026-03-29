import { and, eq } from "drizzle-orm";
import { ArrowLeft, Bath, Bed, Calendar, MapPin, Maximize } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { listing } from "@/db/schema";
import { db } from "@/lib/db";
import { getTenantOrNotFound } from "@/lib/getTenant";
import type { TenantBranding } from "@/lib/types";
import { parseListingData } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ subdomain: string; id: string }>;
}) {
  const t = await getTranslations("ListingDetail");
  const { subdomain, id } = await params;
  const tenant = await getTenantOrNotFound(subdomain);

  const listingData = await db.query.listing.findFirst({
    where: and(eq(listing.id, id), eq(listing.tenantId, tenant.id)),
  });
  if (!listingData) return notFound();

  const { features, address } = parseListingData(listingData);
  const [mainImage, ...otherImages] = listingData.images || [];
  const branding = tenant.branding as TenantBranding | null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> {t("backToCollection")}
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary font-medium mb-2">
              <div className="bg-primary/10 px-3 py-1 rounded-full text-xs uppercase tracking-widest">
                {listingData.status}
              </div>
              {address.city && (
                <span className="text-muted-foreground text-sm flex items-center">
                  <MapPin className="w-3 h-3 mr-1" /> {address.city}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-2">
              {listingData.title}
            </h1>
            <p className="text-xl text-muted-foreground font-light max-w-2xl">
              {address.street}, {address.postalCode} {address.city}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-4xl md:text-5xl font-bold text-primary">
              €{listingData.price.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{t("askingPrice")}</p>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="container mx-auto px-4 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[600px] md:h-[500px] rounded-3xl overflow-hidden">
          <div className="md:col-span-2 md:row-span-2 relative bg-muted group cursor-pointer">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={listingData.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                {t("noImage")}
              </div>
            )}
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="hidden md:block relative bg-muted group cursor-pointer">
              {otherImages[i] ? (
                <Image
                  src={otherImages[i]}
                  alt={`View ${i + 2}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                i === 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-primary font-medium">
                    {t("viewAllPhotos")}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-8 bg-secondary/30 rounded-2xl border border-border/50">
              {[
                { icon: Bed, value: features.beds || 0, label: t("bedrooms") },
                {
                  icon: Bath,
                  value: features.baths || 0,
                  label: t("bathrooms"),
                },
                {
                  icon: Maximize,
                  value: features.sqft || 0,
                  label: t("sqMeters"),
                },
                {
                  icon: Calendar,
                  value: features.yearBuilt || "N/A",
                  label: t("yearBuilt"),
                },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center border-r last:border-0 border-border/50">
                  <Icon className="w-6 h-6 mx-auto text-primary mb-2" />
                  <div className="font-bold text-2xl">{value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">{t("aboutProperty")}</h2>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                {listingData.description?.split("\n").map((p, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: paragraph order is stable
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">{t("featuresAmenities")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.amenities?.length ? (
                  features.amenities.map((a) => (
                    <div
                      key={a}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="font-medium">{a}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">{t("noAmenities")}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border rounded-2xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{t("interested")}</h3>
                <p className="text-muted-foreground text-sm">{t("fillFormBelow")}</p>
              </div>
              <form action={`mailto:${branding?.email ?? ""}`} className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="label-caps block mb-1">
                    {t("fullName")}
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full bg-background border border-input px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="label-caps block mb-1">
                    {t("emailAddress")}
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full bg-background border border-input px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="label-caps block mb-1">
                    {t("phoneNumber")}
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    placeholder="+30 69..."
                    className="w-full bg-background border border-input px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="label-caps block mb-1">
                    {t("message")}
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    className="w-full bg-background border border-input px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                    placeholder={t("messagePlaceholder")}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground font-bold py-4 hover:opacity-90 transition-opacity mt-2 uppercase tracking-widest text-xs"
                >
                  {t("sendRequest")}
                </button>
              </form>
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-xs text-muted-foreground mb-4">{t("orCallDirectly")}</p>
                {branding?.phone ? (
                  <a
                    href={`tel:${branding.phone}`}
                    className="text-lg font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {branding.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground text-sm">{t("noPhoneAvailable")}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
