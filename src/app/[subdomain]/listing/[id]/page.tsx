import { and, eq } from "drizzle-orm";
import { ArrowLeft, Bath, Bed, Calendar, MapPin, Maximize } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listing } from "@/db/schema";
import { db } from "@/lib/db";
import { getTenant } from "@/lib/getTenant";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ subdomain: string; id: string }>;
}) {
  const { subdomain, id } = await params;
  const tenant = await getTenant(subdomain);

  if (!tenant) return notFound();

  // Fetch specific listing
  const listingData = await db.query.listing.findFirst({
    where: and(eq(listing.id, id), eq(listing.tenantId, tenant.id)),
  });

  if (!listingData) return notFound();

  const address = listingData.address as {
    street?: string;
    city?: string;
    zip?: string;
  } | null;
  const features = listingData.features as {
    beds?: number;
    baths?: number;
    sqft?: number;
    built?: number;
    amenities?: string[];
  } | null;

  const mainImage = listingData.images?.[0];
  const otherImages = listingData.images?.slice(1) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header / Breadcrumb */}
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collection
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary font-medium mb-2">
              <div className="bg-primary/10 px-3 py-1 rounded-full text-xs uppercase tracking-widest">
                {listingData.status}
              </div>
              {address?.city && (
                <span className="text-muted-foreground text-sm flex items-center">
                  <MapPin className="w-3 h-3 mr-1" /> {address.city}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-2">
              {listingData.title}
            </h1>
            <p className="text-xl text-muted-foreground font-light max-w-2xl">
              {address?.street}, {address?.zip} {address?.city}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-4xl md:text-5xl font-bold text-primary">
              €{listingData.price.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Asking Price</p>
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
                No Image
              </div>
            )}
          </div>
          <div className="hidden md:block relative bg-muted group cursor-pointer">
            {otherImages[0] && (
              <Image
                src={otherImages[0]}
                alt="Property view 2"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
          </div>
          <div className="hidden md:block relative bg-muted group cursor-pointer">
            {otherImages[1] && (
              <Image
                src={otherImages[1]}
                alt="Property view 3"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
          </div>
          <div className="hidden md:block relative bg-muted group cursor-pointer">
            {otherImages[2] && (
              <Image
                src={otherImages[2]}
                alt="Property view 4"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
          </div>
          <div className="hidden md:block relative bg-muted group cursor-pointer">
            {otherImages[3] ? (
              <Image
                src={otherImages[3]}
                alt="Property view 5"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-primary font-medium">
                View All Photos
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-border/50">
              <div className="text-center border-r last:border-0 border-border/50">
                <Bed className="w-6 h-6 mx-auto text-primary mb-2" />
                <div className="font-bold text-2xl">{features?.beds || 0}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Bedrooms
                </div>
              </div>
              <div className="text-center border-r last:border-0 border-border/50">
                <Bath className="w-6 h-6 mx-auto text-primary mb-2" />
                <div className="font-bold text-2xl">{features?.baths || 0}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Bathrooms
                </div>
              </div>
              <div className="text-center border-r last:border-0 border-border/50">
                <Maximize className="w-6 h-6 mx-auto text-primary mb-2" />
                <div className="font-bold text-2xl">{features?.sqft || 0}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Sq. Meters
                </div>
              </div>
              <div className="text-center">
                <Calendar className="w-6 h-6 mx-auto text-primary mb-2" />
                <div className="font-bold text-2xl">
                  {features?.built || "N/A"}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Year Built
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">About this property</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
                {listingData.description?.split("\n").map((paragraph, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static content
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Features & Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features?.amenities?.map((amenity, index) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: static content
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="font-medium">{amenity}</span>
                  </div>
                )) || (
                  <p className="text-muted-foreground italic">
                    No specific amenities listed.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border rounded-2xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Interested?</h3>
                <p className="text-muted-foreground text-sm">
                  Fill out the form below to schedule a viewing or request more
                  information.
                </p>
              </div>

              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block"
                  >
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    className="w-full bg-background border border-input rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className="w-full bg-background border border-input rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block"
                  >
                    Phone Number
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    className="w-full bg-background border border-input rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="+30 69..."
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    className="w-full bg-background border border-input rounded-lg px-4 py-3 min-h-[120px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                    placeholder="I am interested in this property..."
                  ></textarea>
                </div>

                <button
                  type="button"
                  className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 mt-2"
                >
                  Send Request
                </button>
              </form>

              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-xs text-muted-foreground mb-4">
                  Or call us directly
                </p>
                <a
                  href="tel:+302100000000"
                  className="text-lg font-bold text-foreground hover:text-primary transition-colors"
                >
                  +30 210 000 0000
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
