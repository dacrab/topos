import { Mail, Phone, User } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Team</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Meet the dedicated professionals ready to help you find your dream
            property.
          </p>
        </div>
      </section>

      {/* Agents Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="group bg-card rounded-2xl overflow-hidden border hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
                <User className="w-24 h-24 text-slate-300" />
                {/* Overlay with contact buttons on hover */}
                <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                  <button
                    type="button"
                    className="bg-white text-primary px-6 py-2 rounded-full font-medium hover:bg-slate-100"
                  >
                    View Profile
                  </button>
                </div>
              </div>

              <div className="p-6 text-center">
                <h3 className="text-xl font-bold mb-1">Agent Name {i}</h3>
                <p className="text-sm text-primary font-medium mb-4">
                  Senior Broker
                </p>

                <div className="flex items-center justify-center gap-4 text-muted-foreground">
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                  </Link>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
