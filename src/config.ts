// Application Configuration
// Reads environment variables configured via Vite (.env)

export const config = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3001/api',
  appName: (import.meta.env.VITE_APP_NAME as string) || 'PaperGen Pro',
  appVersion: (import.meta.env.VITE_APP_VERSION as string) || '1.0.0',
  isDev: Boolean(import.meta.env.DEV),
  isProd: Boolean(import.meta.env.PROD),
} as const;

export default config;
