function getEnvVar(name: string, required = true): string {
  const value = process.env[name];
  if (required && !value) throw new Error(`Missing required env var: ${name}`);
  return value || "";
}

export const env = {
  GOOGLE_CLIENT_ID: getEnvVar("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnvVar("GOOGLE_CLIENT_SECRET"),
  NEXTAUTH_SECRET: getEnvVar("NEXTAUTH_SECRET"),
  NEXTAUTH_URL: getEnvVar("NEXTAUTH_URL", false) || "http://localhost:3000",
};
