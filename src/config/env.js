export const env = {
  apiUrl: import.meta.env.VITE_API_URL?.trim() || '',
  appToken: import.meta.env.VITE_API_APP_TOKEN?.trim() || '',
};

export const isApiConfigured = Boolean(env.apiUrl && env.appToken);
