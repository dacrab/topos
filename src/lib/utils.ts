import { type ClassNameValue, twMerge } from "tailwind-merge";

export function cn(...inputs: ClassNameValue[]) {
  return twMerge(inputs);
}

export function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return (email[0] ?? "?").toUpperCase();
}

export function deriveDisplayName(input: {
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  email?: string | null | undefined;
}): string {
  const full = `${input.firstName ?? ""} ${input.lastName ?? ""}`.trim();
  if (full) return full;
  const local = (input.email ?? "").split("@")[0];
  return local || "User";
}
