import { useState, useEffect } from "react";
import { Container, VStack, Flex, Text } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import React from "react";
import ChipScan from "@/components/ChipScan";
import DevModePanel from "@/components/DevModePanel";
import { useRouter } from "next/router";
import ErrorPage from "next/error";
import ClaimNFTPanel from "@/components/ClaimNFTPanel";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";

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
  if (is404) {
    return <ErrorPage statusCode={404} />;
  }
  if (process.env.NEXT_PUBLIC_DISABLED === "true") {
    return (
      <Container>
        <Flex direction="column" align="center" justify="center" m={8}>
          <Text>Mint is not open yet, check back soon.</Text>
        </Flex>
      </Container>
    );
  }

  return (
    <>
      <Hero />
      <Container>
        {_isConnected && process.env.NEXT_PUBLIC_DEV_MODE === "true" && (
          <DevModePanel />
        )}
        {_isConnected && (
          <VStack>
            <ClaimNFTPanel />
            <ChipScan />
          </VStack>
        )}
      </Container>
      <Footer />
    </>
  );
}
