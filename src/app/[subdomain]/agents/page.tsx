import { eq } from "drizzle-orm";
import { Mail, Phone, User, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/page";
import { teamMember, user } from "@/db/schema";
import { db } from "@/lib/db";
import { getTenant } from "@/lib/getTenant";
import { getInitials } from "@/lib/utils";

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
    <div className="shell-wide py-14 md:py-20">
      <div className="grid gap-8 border-b-2 border-foreground/85 pb-10 lg:grid-cols-12 lg:gap-0">
        <div className="lg:col-span-8 lg:pr-10">
          <p className="chip-eyebrow mb-7">
            <Users className="h-3 w-3" />
            {t("agents")}
          </p>
          <h1 className="font-display text-[clamp(2.75rem,6vw,5rem)] font-normal leading-[0.96] tracking-[-0.04em]">
            {t("ourTeam")}
          </h1>
        </div>
        <p className="self-end text-sm leading-relaxed text-muted-foreground lg:col-span-4 lg:border-l lg:border-border lg:pl-8">
          {t("teamDescription")}
        </p>
      </div>

      {agents.length === 0 ? (
        <EmptyState className="mt-10 py-20" icon={<Users className="h-5 w-5" />}>
          {t("noAgents")}
        </EmptyState>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <article key={agent.id} className="flex flex-col">
              <div className="media-frame">
                {agent.image ? (
                  <Image
                    src={agent.image}
                    alt={agent.name ?? ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : agent.name ? (
                  <div className="absolute inset-0 flex items-center justify-center font-display text-5xl text-muted-foreground/40">
                    {getInitials(agent.name, agent.email ?? "")}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <User className="h-12 w-12 opacity-25" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col border-t border-border pt-3.5">
                <h2 className="font-display text-xl tracking-[-0.01em]">{agent.name}</h2>
                {agent.title && <p className="mt-1 meta-caps text-accent">{agent.title}</p>}
                {agent.bio && (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {agent.bio}
                  </p>
                )}
                <div className="mt-auto flex items-center gap-2 pt-4">
                  {agent.email && (
                    <Link
                      href={`mailto:${agent.email}`}
                      aria-label={t("emailUs")}
                      className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </Link>
                  )}
                  {agent.phone && (
                    <Link
                      href={`tel:${agent.phone}`}
                      aria-label={t("callUs")}
                      className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
