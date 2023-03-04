import { useState, useEffect } from "react";
import { Container, VStack, Text, Flex, Box, Image } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import ConnectWallet from "@/components/ConnectWallet";
import React from "react";
import ChipScan from "@/components/ChipScan";
import DevModePanel from "@/components/DevModePanel";
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
  if (is404) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <>
      <Flex justify="center">
        <Flex justify="flex-end" width="100%" mx={8} my={6} maxWidth="1200px">
          <ConnectWallet />
        </Flex>
      </Flex>
      <Container>
        <Flex direction="column" align="center" justify="center" m={8}>
          <VStack>
            <Image
              src="/assets/logo_header.svg"
              alt="RaidBrood Logo"
              width="180px"
              height="180px"
            />
          </VStack>
          <Flex direction="column" align="center" justify="center" m={8}>
            {_isConnected && process.env.NEXT_PUBLIC_DEV_MODE && (
              <DevModePanel />
            )}
            {_isConnected && (
              <VStack>
                <ChipScan />
              </VStack>
            )}
          </Flex>
        </Flex>
      </Container>
    </>
  );
}
