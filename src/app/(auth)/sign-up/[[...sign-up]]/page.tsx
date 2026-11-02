import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      signInUrl="/sign-in"
      fallbackRedirectUrl="/dashboard"
      appearance={{
        variables: { colorPrimary: "var(--primary)", borderRadius: "0.125rem" },
        elements: {
          rootBox: "w-full",
          card: "shadow-none border-0 bg-transparent p-0",
          headerTitle: "font-display text-2xl tracking-tight",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton: "border-border bg-card hover:bg-secondary/60",
          formButtonPrimary: "bg-primary text-primary-foreground hover:bg-accent",
          footerActionLink: "text-accent hover:text-accent/80",
          formFieldInput: "rounded-[2px]",
        },
      }}
    />
  );
}
