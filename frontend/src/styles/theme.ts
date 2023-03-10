import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};
// red #ff3864
const components = {
  Button: {
    // 1. We can update the base styles
    baseStyle: {
      fontFamily: "Texturina",
      background: "#ff3864",
      _hover: {
        bg: "#ff3864",
        // bg: mode(`gray.200`, `whiteAlpha.300`)(props),
      },
    },
  },
  Body: {
    baseStyle: {
      background: "#0f0f0e",
    },
  },
};
const styles = {
  global: {
    "html, body": {
      color: "white",
      background: "#0f0f0e",
    },
  },
};

const theme = extendTheme({ config, components, styles });

export default theme;
