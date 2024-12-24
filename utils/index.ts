export const envMap = {
  env: process.env.UMI_APP_ENV || 'dev',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};
