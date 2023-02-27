import chakraTheme from "@chakra-ui/theme";
import type { AppProps } from "next/app";
import { useToast, RGThemeProvider } from "@raidguild/design-system";
import { DefaultSeo } from "next-seo";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { wagmiClient } from "../utils/wagmiClient";
import { WagmiConfig } from "wagmi";
import { chains } from "../utils/chains";
import "../styles/globals.css";
import "react-datepicker/dist/react-datepicker.css";
import "@fontsource/texturina";
import "@fontsource/space-mono";
import "@rainbow-me/rainbowkit/styles.css";
import React from "react";
import { AppStateProvider } from "../context/appState";

// const theme = extendBaseTheme({
//   components: {},
// });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RGThemeProvider>
      <DefaultSeo
        title="Blood of Moloch NFT"
        defaultTitle="Blood of Moloch NFT"
        description="Blood of Moloch NFT"
        canonical="https://bloodofmoloch.xyz"
      />
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} theme={darkTheme()}>
          <AppStateProvider>
            <Component {...pageProps} />
          </AppStateProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </RGThemeProvider>
  );
}
