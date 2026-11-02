CREATE TABLE "rateLimit" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"resetAt" timestamp with time zone NOT NULL
);
