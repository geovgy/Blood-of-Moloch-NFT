import Head from "next/head";
import { Container, Text, Flex, Box } from "@raidguild/design-system";
import Image from "next/image";
import { Inter } from "next/font/google";
import ChipScan from "@/components/ChipScan";
import ConnectWallet from "@/components/ConnectWallet";

export default function Home() {
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
            <ChipScan />
          </Flex>
        </Flex>
      </Container>
    </>
  );
}
