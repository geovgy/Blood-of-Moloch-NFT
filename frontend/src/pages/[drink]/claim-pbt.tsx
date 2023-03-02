import { useState, useEffect } from "react";
import { Container, VStack, Text, Flex, Box, Image } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import ClaimNFTPanel from "@/components/ClaimNFTPanel";
import ConnectWallet from "@/components/ConnectWallet";
import React from "react";
import DrinkNFTPanel from "@/components/DrinkNFTPanel";
import MintMockNFT from "@/components/MintMockNFT";
import { useRouter } from "next/router";
import ErrorPage from "next/error";

export default function ClaimBaBom() {
  const { address, isConnected } = useAccount();
  const [is404, setIs404] = useState(false);
  const [_isConnected, _setIsConnected] = useState(false);
  const router = useRouter();
  // this fixes issue with NextJS: Error: Hydration failed
  useEffect(() => {
    _setIsConnected(isConnected);
  }, [isConnected]);
  useEffect(() => {
    if (router.query.drink && router.query.drink !== "babom") {
      setIs404(true);
    }
  }, [router.query.drink]);
  console.log(
    "router",
    router,
    router.query.drink,
    is404,
    router.query.drink !== "babom"
  );
  if (is404) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <>
      <Container>
        <Flex direction="column" align="center" justify="center" m={8}>
          <VStack>
            <Image
              src="/assets/logo_header.svg"
              alt="RaidBrood Logo"
              width="280px"
              height="280px"
            />
            {/* <Text fontSize="42px" as="h1" fontFamily="texturina">
              Blood of Moloch NFT
            </Text> */}
            <Text>5</Text>
          </VStack>
          <Flex direction="column" align="center" justify="center" m={8}>
            <Box mt={8} mb={4}>
              <ConnectWallet />
            </Box>
            {_isConnected && process.env.NEXT_PUBLIC_DEV_MODE && (
              <MintMockNFT />
            )}
            {_isConnected && (
              <VStack>
                <ClaimNFTPanel /> <DrinkNFTPanel />
              </VStack>
            )}
          </Flex>
        </Flex>
      </Container>
    </>
  );
}
