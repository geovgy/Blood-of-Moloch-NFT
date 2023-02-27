import React, { useState } from "react";
import { Flex, Text, Button } from "@raidguild/design-system";
import { useSigner, useContract } from "wagmi";
import BloodOfMolochPBT from "../artifacts/contracts/BloodOfMolochPBT.sol/BloodOfMolochPBT.json";
import { useAppState } from "../context/AppState";

const DrinkNFTPanel = () => {
  const { data: signer } = useSigner();
  const { claimTokenId, signatureFromChip, blockNumberUsedInSig } =
    useAppState();
  const claimNFT = useContract({
    addressOrName: process.env.NEXT_PUBLIC_DRINK_NFT_ADDRESS || "",
    abi: BloodOfMolochPBT.abi,
    signerOrProvider: signer,
  });

  const claimDrink = async () => {
    if (claimNFT) {
      const tx = await claimNFT.mint(claimTokenId, signatureFromChip, blockNumberUsedInSig);
    }
  };
  return (
    <Flex>
      <Text fontSize="38px">Mint your Drink NFT</Text>
      <Button onClick={claimDrink}>Claim Drink NFT</Button>
    </Flex>
  );
};

export default DrinkNFTPanel;
