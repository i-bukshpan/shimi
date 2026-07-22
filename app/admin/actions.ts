"use server";

export async function checkAdminPassword(password: string) {
  // If ADMIN_PASSWORD is not set in .env.local, fallback to "1234"
  const correctPassword = process.env.ADMIN_PASSWORD || "1234";
  return password === correctPassword;
}
