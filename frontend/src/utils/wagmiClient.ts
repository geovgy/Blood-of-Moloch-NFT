/* eslint-disable import/prefer-default-export */
import { createClient } from "wagmi";
import { connectorsForWallets, getDefaultWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  argentWallet,
  braveWallet,
  coinbaseWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

import { chains, provider } from "./chains";
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || '';

const {wallets} = getDefaultWallets({
  appName: "Blood-of-moloch-PBT",
  projectId,
  chains,
})
const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "Others",
    wallets: [
      rainbowWallet({ projectId, chains }),
      coinbaseWallet({ chains, appName: "Blood of Moloch" }),
      argentWallet({ projectId, chains }),
      braveWallet({ chains }),
      metaMaskWallet({projectId, chains}),
      walletConnectWallet({projectId, chains}),
      injectedWallet({chains}),
      ledgerWallet({projectId, chains})

    ],
  },
]);



// const connector = new WalletConnectConnector({
//   chains,
//   options: {
//     projectId,
//     showQrModal: true
//   }
// })

export const wagmiClient = createClient({
  autoConnect: true,
  provider,
  connectors: connectors,
});

