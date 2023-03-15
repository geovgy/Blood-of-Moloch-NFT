import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { DefaultSeo } from "next-seo";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { wagmiClient } from "../utils/wagmiClient";
import { WagmiConfig } from "wagmi";
import { chains } from "../utils/chains";
import "../styles/globals.css";
import "react-datepicker/dist/react-datepicker.css";
import "@fontsource/texturina";
import "@fontsource/space-mono";
import "@fontsource/space-mono";
import "@fontsource/uncial-antiqua";
import "@rainbow-me/rainbowkit/styles.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";
import { AppStateProvider } from "../context/AppContext";
import theme from "../styles/theme";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ChakraProvider theme={theme}>
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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </ChakraProvider>
  );
}
