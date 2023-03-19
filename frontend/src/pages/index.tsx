import { useState, useEffect } from "react";
import { Container, Text, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import ClaimNFTPanel from "@/components/ClaimNFTPanel";
import ConnectWallet from "@/components/ConnectWallet";
import React from "react";

export default function Home() {
  const { isConnected } = useAccount();
  const [_isConnected, _setIsConnected] = useState(false);
  const router = useRouter();

  useEffect(() => {
    router.push("/babom/claim-pbt");
  }, []);

  // this fixes issue with NextJS: Error: Hydration failed
  useEffect(() => {
    _setIsConnected(isConnected);
  }, [isConnected]);

  process.env.NEXT_PUBLIC_DEV_MODE === "true" &&
    console.log(`process.env: ${JSON.stringify(process.env)}`);
  return (
    <>
      <Container>
        <Flex direction="column" align="center" justify="center" m={8}>
          <Flex mt={8} mb={4} align="flex-end">
            <ConnectWallet />
          </Flex>
          <Text fontSize="28px" as="h1" fontFamily="texturina">
            Blood of Moloch NFT
          </Text>
          <Flex direction="column" align="center" justify="center" m={8}>
            {_isConnected && <ClaimNFTPanel />}
          </Flex>
        </Flex>
      </Container>
    </>
  );
}
