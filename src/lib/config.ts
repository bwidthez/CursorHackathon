export function getEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const config = {
  minimax: {
    apiKey: process.env.MINIMAX_API_KEY ?? "",
  },
  mongodb: {
    uri: process.env.MONGODB_URI ?? "",
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  },
  api: {
    /**
     * Base URL for the separate backend services that your teammates are building.
     * Example: https://api.rentshield.yourdomain.com
     */
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000",
  },
} as const;
