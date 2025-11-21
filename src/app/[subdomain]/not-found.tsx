import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Site Not Found</h1>
      <p className="text-muted-foreground mb-8">
        The real estate agency you are looking for does not exist or has been
        moved.
      </p>
      <Link href="/" className="text-primary hover:underline">
        Go to Aether Home
      </Link>
    </div>
  );
}
