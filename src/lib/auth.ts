import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";

export async function getSession() {
  const { userId } = await clerkAuth();
  if (!userId) return null;
  const user = await currentUser();
  if (!user) return null;
  return {
    user: {
      id: userId,
      name:
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
        (user.emailAddresses[0]?.emailAddress ?? ""),
      email: user.emailAddresses[0]?.emailAddress ?? "",
    },
  };
}
