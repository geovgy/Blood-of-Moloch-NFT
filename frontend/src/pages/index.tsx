import { useState, useEffect } from "react";
import Head from "next/head";
import { Container, Text, Flex, Box, Button, Heading } from "@chakra-ui/react";
import Image from "next/image";
import { Inter } from "next/font/google";
import { useAccount } from "wagmi";
import ChipScan from "@/components/ChipScan";
import ClaimNFTPanel from "@/components/ClaimNFTPanel";
import ConnectWallet from "@/components/ConnectWallet";
import React from "react";
import DrinkNFTPanel from "@/components/DrinkNFTPanel";
import MintMockNFT from "@/components/MintMockNFT";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [_isConnected, _setIsConnected] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.address) {
      _setIsConnected(true);
    }
  }, [session]);

  // this fixes issue with NextJS: Error: Hydration failed
  useEffect(() => {
    _setIsConnected(isConnected);
  }, [isConnected]);

  const KeypLogin = () => {
    const LoginButton = ({ provider }) => (
      <Button
        m={"2"}
        color="#EC4899"
        bg={"#fff"}
        w={"100%"}
        maxW={"600px"}
        onClick={() =>
          signIn("keyp", null, `login_provider=${provider.toUpperCase()}`)
        }
      >
        {provider}
      </Button>
    );
    if (session?.user?.address)
      return (
        <Flex direction={"column"} maxW={"600px"}>
          <Heading m={"3"} size={"md"}>
            Connected with Keyp Wallet {session?.user?.address}
          </Heading>
        </Flex>
      );
    return (
      <Flex direction={"column"} maxW={"600px"}>
        <Heading m={"3"} size={"md"}>
          Create a new wallet
        </Heading>
        <LoginButton provider="Discord" />
        <LoginButton provider="Google" />
        <LoginButton provider="Chess" />
      </Flex>
    );
  };

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
            <KeypLogin />
            {_isConnected && process.env.NEXT_PUBLIC_DEV_MODE && (
              <MintMockNFT />
            )}
            {_isConnected && <ClaimNFTPanel />}
            {_isConnected && <DrinkNFTPanel />}
          </Flex>
        </Flex>
      </Container>
    </>
  );
}
