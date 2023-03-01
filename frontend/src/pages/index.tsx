import { useState, useEffect } from 'react';
import Head from "next/head";
import { Container, Text, Flex, Box } from "@chakra-ui/react";
import Image from "next/image";
import { Inter } from "next/font/google";
import { useAccount } from "wagmi";
import ChipScan from "@/components/ChipScan";
import ClaimNFTPanel from "@/components/ClaimNFTPanel";
import ConnectWallet from "@/components/ConnectWallet";
import React from "react";
import DrinkNFTPanel from "@/components/DrinkNFTPanel";
import MintMockNFT from "@/components/MintMockNFT";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [_isConnected, _setIsConnected] = useState(false);
  // this fixes issue with NextJS: Error: Hydration failed 
  useEffect(() => {
    _setIsConnected(isConnected);
  }, [isConnected]);
  return (
    <>
      <Container>
        <Flex direction="column" align="center" justify="center" m={8}>
          <Text fontSize="42px" as="h1" fontFamily="texturina">
            Blood of Moloch NFT
          </Text>
          <Flex direction="column" align="center" justify="center" m={8}>
            <Box mt={8} mb={4}>
              <ConnectWallet />
            </Box>
            {_isConnected && process.env.NEXT_PUBLIC_DEV_MODE && <MintMockNFT />}
            {_isConnected && <ClaimNFTPanel />}
            {_isConnected && <DrinkNFTPanel />}
          </Flex>
        </Flex>
      </Container>
    </>
  );
}
