import { useState, useEffect } from "react";
import { Container, Text, Flex, Box } from "@chakra-ui/react";
import React from "react";
import { redirect } from "next/navigation";

export default function Home() {
  useEffect(() => {
    redirect("/babom/claim-pbt");
  });
  return (
    <>
      <Container>
        <Flex direction="column" align="center" justify="center" m={8}>
          <Text fontSize="42px" as="h1" fontFamily="texturina">
            Blood of Moloch NFT
          </Text>
        </Flex>
      </Container>
    </>
  );
}
