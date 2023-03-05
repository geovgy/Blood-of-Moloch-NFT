import React from "react";
import { VStack, Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { useSigner, useContract } from "wagmi";
import BloodOfMolochPBT from "../artifacts/contracts/BloodOfMolochPBT.sol/BloodOfMolochPBT.json";
import { useAppState } from "../context/AppContext";
import ChipScan from "./ChipScan";

const DrinkNFTPanel = () => {
  const { data: signer } = useSigner();
  const { claimTokenId, signatureFromChip, blockHashUsedInSig } = useAppState();
  const claimNFT = useContract({
    address: process.env.NEXT_PUBLIC_PBT_ADDRESS || "",
    abi: BloodOfMolochPBT.abi,
    signerOrProvider: signer,
  });

  const claimDrink = async () => {
    if (claimNFT) {
      const tx = await claimNFT.mint(
        claimTokenId,
        signatureFromChip,
        blockHashUsedInSig
      );
      const result = tx.wait();
      process.env.NEXT_PUBLIC_DEV_MODE &&
        console.log(`mint PBT result ${result}`);
    }
  };
  const canMint = claimTokenId && signatureFromChip && blockHashUsedInSig;
  return (
    <VStack align="center">
      <Text fontSize="xl" mb={8} textAlign="center" fontFamily="texturina">
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
