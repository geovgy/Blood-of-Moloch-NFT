import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};

const components = {
  Button: {
    // 1. We can update the base styles
    baseStyle: {
      fontFamily: "Texturina",
      background: "#ff3864",
    },
  },
  Body: {
    baseStyle: {
      background: "#0f0f0e",
    },
  },
};

const theme = extendTheme({ config, components });

export default theme;
