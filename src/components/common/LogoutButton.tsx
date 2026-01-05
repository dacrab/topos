"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type LogoutButtonProps = {
  title?: string;
  size?: number;
  className?: string;
};

export function LogoutButton({
  title = "Log out",
  size = 14,
  className = "text-muted-foreground hover:text-foreground transition-colors",
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            router.push("/sign-in");
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to sign out. Please try again.");
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
      title={title}
    >
      <LogOut size={size} className={isLoading ? "animate-pulse" : ""} />
    </button>
  );
}
