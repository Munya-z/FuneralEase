import type { Config } from "tailwindcss";
import baseConfig from "@funeralease/config/tailwind";

const config: Config = {
  ...baseConfig,
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      borderRadius: {
        'bdr': '12px',
        'bdr-inr': '6px',
      }
    }
  },
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};

export default config;
