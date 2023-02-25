import Head from "next/head";
import { Container, Text, Flex } from "@chakra-ui/react";
import Image from "next/image";
import { Inter } from "next/font/google";
import ChipScan from "@/components/ChipScan";

export default function Home() {
  return (
    <>
      <Container>
        <Flex direction="column" align="center" justify="center" m={8}>
          <Text fontSize="42px" as="h1" fontFamily="texturina">
            Blood of Moloch NFT
          </Text>
          <Flex direction="column" align="center" justify="center" m={8}>
            <ChipScan />
          </Flex>
        </Flex>
      </Container>
    </>
  );
}
