"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type LogoutButtonProps = {
  size?: number;
  className?: string;
};

export function LogoutButton({
  size = 14,
  className = "text-muted-foreground hover:text-foreground transition-colors",
}: LogoutButtonProps) {
  const t = useTranslations("Common");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success(t("signedOutSuccess"));
            router.push("/sign-in");
            router.refresh();
          },
        },
      });
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: user-facing error logging
      console.error("Logout failed:", error);
      toast.error(t("signOutFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
      title={t("logOut")}
    >
      <LogOut size={size} className={isLoading ? "animate-pulse" : ""} />
    </button>
  );
}
