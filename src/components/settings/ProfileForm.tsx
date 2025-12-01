"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/app/(dashboard)/settings/actions";

type ProfileFormProps = {
  currentUser: {
    name: string | null;
    email: string;
    image: string | null;
    role: string | null;
    createdAt: Date;
    updatedAt: Date;
    emailVerified: boolean;
    banned: boolean | null;
  };
};

export function ProfileForm({ currentUser }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-xl">
      {/* Profile Picture */}
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 bg-foreground flex items-center justify-center text-2xl font-bold text-background flex-shrink-0">
          {currentUser?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="flex-1 space-y-2">
          <label
            htmlFor="image"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            Profile Image URL
          </label>
          <input
            id="image"
            name="image"
            type="url"
            className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
            defaultValue={currentUser?.image ?? ""}
            placeholder="https://example.com/avatar.jpg"
          />
          <p className="text-xs text-muted-foreground">
            Enter a URL for your profile picture
          </p>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
        >
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
          defaultValue={currentUser?.name ?? ""}
          placeholder="John Doe"
        />
      </div>

      {/* Email (read-only) */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          disabled
          className="block w-full border border-input bg-muted py-2 px-3 text-muted-foreground shadow-sm sm:text-sm cursor-not-allowed"
          defaultValue={currentUser?.email ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed. Contact support if you need to update it.
        </p>
      </div>

      {/* Role (read-only) */}
      <div className="space-y-2">
        <label
          htmlFor="role"
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
        >
          Role
        </label>
        <input
          id="role"
          name="role"
          type="text"
          disabled
          className="block w-full border border-input bg-muted py-2 px-3 text-muted-foreground shadow-sm sm:text-sm cursor-not-allowed capitalize"
          defaultValue={currentUser?.role ?? "user"}
        />
      </div>

      {/* Account Info */}
      <div className="border border-border p-4 space-y-3 bg-secondary/30">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Account Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Member since</span>
            <p className="font-mono">
              {currentUser?.createdAt.toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Last updated</span>
            <p className="font-mono">
              {currentUser?.updatedAt.toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Email verified</span>
            <p className="font-mono">
              {currentUser?.emailVerified ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Account status</span>
            <p className="font-mono">
              {currentUser?.banned ? "Banned" : "Active"}
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-primary-foreground px-6 py-3 font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
