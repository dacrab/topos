import { eq } from "drizzle-orm";
import { Mail, Phone, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { teamMember, user } from "@/db/schema";
import { db } from "@/lib/db";
import { getTenant } from "@/lib/getTenant";

export default async function AgentsPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const tenant = await getTenant(subdomain);
  if (!tenant) notFound();
  const t = await getTranslations("Tenant");

  const agents = await db
    .select({
      id: teamMember.id,
      name: user.name,
      email: user.email,
      image: teamMember.image,
      title: teamMember.title,
      phone: teamMember.phone,
      bio: teamMember.bio,
    })
    .from(teamMember)
    .innerJoin(user, eq(teamMember.userId, user.id))
    .where(eq(teamMember.tenantId, tenant.id));

  return (
    <div className="container mx-auto px-8 max-w-screen-xl py-24">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          {t("ourTeam")}
        </h1>
        <div className="flex-1 h-px bg-border/60" />
      </div>
      <p className="text-muted-foreground mb-12 max-w-xl">{t("teamDescription")}</p>

      {agents.length === 0 ? (
        <div className="border border-dashed border-border/60 py-20 text-center text-muted-foreground rounded-2xl">
          <User className="w-10 h-10 mx-auto mb-4 opacity-30" />
          <p>{t("noAgents")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {agents.map((a) => (
            <div
              key={a.id}
              className="border border-border/60 shadow-card rounded-2xl overflow-hidden bg-card card-hover"
            >
              <div className="h-2 bg-accent/10 arch-top shrink-0" />
              <div className="aspect-square bg-muted relative">
                {a.image ? (
                  <Image
                    src={a.image}
                    alt={a.name ?? ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <User className="w-12 h-12 opacity-30" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-display font-semibold text-lg mb-1">{a.name}</h3>
                {a.title && <p className="text-sm text-muted-foreground mb-2">{a.title}</p>}
                {a.bio && (
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{a.bio}</p>
                )}
                <div className="flex gap-3">
                  {a.email && (
                    <Link
                      href={`mailto:${a.email}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </Link>
                  )}
                  {a.phone && (
                    <Link
                      href={`tel:${a.phone}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
