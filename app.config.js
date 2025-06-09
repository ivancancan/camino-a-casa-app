import dotenvFlow from 'dotenv-flow';

dotenvFlow.config({
  node_env: process.env.NODE_ENV || 'staging',
});

console.log('Variables de entorno (NODE_ENV):', process.env.NODE_ENV);
console.log('API_URL:', process.env.API_URL);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY);

export default ({ config }) => {
  const env = process.env.NODE_ENV || 'staging';

  return {
    ...config,
    extra: {
      API_URL: process.env.API_URL || process.env.EXPO_PUBLIC_API,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      ENV: env,
    },
  };
};
