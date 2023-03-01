import React, { useState } from "react";
import { VStack, Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { useSigner, useContract } from "wagmi";
import BloodOfMolochPBT from "../artifacts/contracts/BloodOfMolochPBT.sol/BloodOfMolochPBT.json";
import { useAppState } from "../context/AppContext";
import ChipScan from "./ChipScan";

const DrinkNFTPanel = () => {
  const { data: signer } = useSigner();
  const { claimTokenId, signatureFromChip, blockNumberUsedInSig } =
    useAppState();
  const claimNFT = useContract({
    addressOrName: process.env.NEXT_PUBLIC_DRINK_NFT_ADDRESS || "",
    abi: BloodOfMolochPBT.abi,
    signerOrProvider: signer,
  });

  // 1. scan
  // 2. approve
  // 3. mint

  const claimDrink = async () => {
    if (claimNFT) {
      const tx = await claimNFT.mint(
        claimTokenId,
        signatureFromChip,
        blockNumberUsedInSig
      );
      const result = tx.wait();
      console.log(`mint PBT result ${result}`);
    }
  };
  const canMint = claimTokenId && signatureFromChip && blockNumberUsedInSig;
  return (
    <VStack align="center">
      <Text fontSize="4xl" mb={8} textAlign="center" fontFamily="texturina">
        Step 2. Mint your Drink NFT
      </Text>

      <ChipScan />
      <Text fontSize="lg" my={10}>
        Part C. Ready to Mint!
      </Text>
      {!canMint && (
        <Text fontSize="xs" mb={8} color="gray.600">
          Not ready to mint, must get signature from the Chip first.
        </Text>
      )}
      <Button disabled={!canMint} onClick={claimDrink}>
        Claim Drink NFT
      </Button>
    </VStack>
  );
};

export default DrinkNFTPanel;
