export const getEnvVar = (key: string): string => {
  const value = import.meta.env[`VITE_${key}`] || process.env[`VITE_${key}`];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};