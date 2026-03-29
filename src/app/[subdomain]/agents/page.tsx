import { eq } from "drizzle-orm";
import { Mail, Phone, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { agent } from "@/db/schema";
import { db } from "@/lib/db";
import { getTenantOrNotFound } from "@/lib/getTenant";

export const dynamic = "force-dynamic";

export default async function AgentsPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const tenant = await getTenantOrNotFound(subdomain);
  const t = await getTranslations("Tenant");

  const agents = await db.select().from(agent).where(eq(agent.tenantId, tenant.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{t("ourTeam")}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("teamDescription")}</p>
        </div>
      </section>

      {/* Agents Grid */}
      <div className="container mx-auto px-4 py-16">
        {agents.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{t("noAgents")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {agents.map((agentItem) => (
              <div
                key={agentItem.id}
                className="group bg-card rounded-2xl overflow-hidden border hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-square bg-muted relative flex items-center justify-center overflow-hidden">
                  {agentItem.image ? (
                    <Image
                      src={agentItem.image}
                      alt={agentItem.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-24 h-24 text-slate-300" />
                  )}
                </div>

                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-1">{agentItem.name}</h3>
                  <p className="text-sm text-primary font-medium mb-2">{agentItem.title}</p>
                  {agentItem.bio && (
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                      {agentItem.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-4 text-muted-foreground">
                    {agentItem.email && (
                      <Link
                        href={`mailto:${agentItem.email}`}
                        className="hover:text-primary transition-colors"
                      >
                        <Mail className="w-5 h-5" />
                      </Link>
                    )}
                    {agentItem.phone && (
                      <Link
                        href={`tel:${agentItem.phone}`}
                        className="hover:text-primary transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
