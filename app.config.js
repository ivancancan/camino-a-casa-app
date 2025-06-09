import dotenvFlow from 'dotenv-flow';

dotenvFlow.config({
  node_env: process.env.NODE_ENV || 'staging',
});

const env = process.env.NODE_ENV || 'staging';

export default ({ config }) => ({
  ...config,
  name: "Arya",
  slug: "arya",
  owner: "ivancancan",
  scheme: "com.arya.app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/arya.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/arya-splash-2.png",
    resizeMode: "contain",
    backgroundColor: "#f8f2ff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.ivancancan.aryaapp",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.arya.app",
    adaptiveIcon: {
      foregroundImage: "./assets/arya-adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
  },
  web: {
    favicon: "./assets/arya.png",
  },
  extra: {
    eas: {
      projectId: "4d84b3fe-1670-4aa7-9c52-f44a8071869c",
    },
    API_URL: process.env.API_URL || process.env.EXPO_PUBLIC_API,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    ENV: env,
  },
});
