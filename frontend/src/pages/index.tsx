import { useState, useEffect } from "react";
import Head from "next/head";
import { Container, Text, Flex, Box, Button, Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import { useAccount } from "wagmi";
import ClaimNFTPanel from "@/components/ClaimNFTPanel";
import ConnectWallet from "@/components/ConnectWallet";
import React from "react";
import DrinkNFTPanel from "@/components/DrinkNFTPanel";
import DevModePanel from "@/components/DevModePanel";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [_isConnected, _setIsConnected] = useState(false);
  // const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    router.push("/babom/claim-pbt");
  }, []);

  // useEffect(() => {
  //   if (session?.user?.address) {
  //     _setIsConnected(true);
  //   }
  // }, [session]);

  // this fixes issue with NextJS: Error: Hydration failed
  useEffect(() => {
    _setIsConnected(isConnected);
  }, [isConnected]);

  // const KeypLogin = () => {
  //   const LoginButton = ({ provider }) => (
  //     <Button
  //       m={"2"}
  //       color="#EC4899"
  //       bg={"#fff"}
  //       w={"100%"}
  //       maxW={"600px"}
  //       onClick={() =>
  //         signIn("keyp", null, `login_provider=${provider.toUpperCase()}`)
  //       }
  //     >
  //       {provider}
  //     </Button>
  //   );
  //   if (session?.user?.address)
  //     return (
  //       <Flex direction={"column"} maxW={"600px"}>
  //         <Heading m={"3"} size={"md"}>
  //           Connected with Keyp Wallet {session?.user?.address}
  //         </Heading>
  //       </Flex>
  //     );
  //   return (
  //     <Flex direction={"column"} maxW={"600px"}>
  //       <Heading m={"3"} size={"md"}>
  //         Create a new wallet
  //       </Heading>
  //       <LoginButton provider="Discord" />
  //       <LoginButton provider="Google" />
  //       <LoginButton provider="Chess" />
  //     </Flex>
  //   );
  // };

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
            {/* <KeypLogin /> */}
            {_isConnected && process.env.NEXT_PUBLIC_DEV_MODE && (
              <DevModePanel />
            )}
            {_isConnected && <ClaimNFTPanel />}
            {_isConnected && <DrinkNFTPanel />}
          </Flex>
        </Flex>
      </Container>
    </>
  );
}
