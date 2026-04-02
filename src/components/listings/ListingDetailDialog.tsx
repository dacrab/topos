"use client";

import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ListingSelect } from "@/db/schema";
import { formatDate, formatPrice, truncateId } from "@/lib/format";
import { getListingStatusLabelKey, parseListingData } from "@/lib/listing";
import {
  AddressSection,
  AmenitiesSection,
  DetailSection,
  ImageGallery,
  PropertyDetailsSection,
} from "./ListingDetailSections";

export function ListingDetailDialog({
  listing,
  trigger,
}: {
  listing: ListingSelect;
  trigger: React.ReactNode;
}) {
  const t = useTranslations("Listings");
  const [open, setOpen] = useState(false);

  const { features, address } = parseListingData(listing);
  const images = listing.images || [];
  const amenities = features.amenities || [];
  const addressParts = [address.street, address.area, address.city, address.postalCode].filter(
    Boolean,
  );
  const addressString = addressParts.length ? addressParts.join(", ") : t("noAddress");

  const labels = {
    propertyDetails: t("propertyDetails"),
    type: t("type"),
    bedrooms: t("bedrooms"),
    bathrooms: t("bathrooms"),
    size: t("size"),
    yearBuilt: t("yearBuilt"),
    description: t("description"),
    amenities: t("amenities"),
    location: t("location"),
    street: t("street"),
    city: t("city"),
    area: t("area"),
    postalCode: t("postalCode"),
    "propertyType.apartment": t("propertyTypeApartment"),
    "propertyType.house": t("propertyTypeHouse"),
    "propertyType.villa": t("propertyTypeVilla"),
    "propertyType.penthouse": t("propertyTypePenthouse"),
    "propertyType.studio": t("propertyTypeStudio"),
    "propertyType.land": t("propertyTypeLand"),
    "propertyType.commercial": t("propertyTypeCommercial"),
    "amenity.parking": t("amenityParking"),
    "amenity.pool": t("amenityPool"),
    "amenity.garden": t("amenityGarden"),
    "amenity.balcony": t("amenityBalcony"),
    "amenity.elevator": t("amenityElevator"),
    "amenity.ac": t("amenityAc"),
    "amenity.heating": t("amenityHeating"),
    "amenity.furnished": t("amenityFurnished"),
    "amenity.petFriendly": t("amenityPetFriendly"),
    "amenity.security": t("amenitySecurity"),
    "amenity.gym": t("amenityGym"),
    "amenity.storage": t("amenityStorage"),
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {listing.title}
              </DialogTitle>
              <DialogDescription className="sr-only">{t("propertyDetails")}</DialogDescription>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{addressString}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-2xl font-mono font-bold">{formatPrice(listing.price)}</span>
              <div className="flex gap-2">
                <Badge>{t(getListingStatusLabelKey(listing.status))}</Badge>
                {features.listingType && (
                  <Badge variant="primary">
                    {features.listingType === "rent" ? t("forRent") : t("forSale")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <ImageGallery images={images} title={listing.title} />
          <PropertyDetailsSection features={features} labels={labels} />
          {listing.description && (
            <DetailSection title={labels.description}>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </DetailSection>
          )}
          <AmenitiesSection amenities={amenities} title={labels.amenities} labels={labels} />
          <AddressSection address={address} labels={labels} />
          <div className="pt-4 border-t border-border text-xs text-muted-foreground flex justify-between">
            <span>
              {t("listedOn")} {formatDate(listing.createdAt)}
            </span>
            <span>ID: {truncateId(listing.id)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
