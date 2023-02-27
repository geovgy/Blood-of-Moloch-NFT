import { useState, useEffect } from "react";
import { Text, Flex, Icon, Button, HStack } from "@raidguild/design-system";
import { useSigner, useContract } from "wagmi";
import BloodOfMolochClaimNFT from "../artifacts/contracts/BloodOfMolochClaimNFT.sol/BloodOfMolochClaimNFT.json";
import React from "react";
import { useAppState } from "@/context/AppState";
import { FaCheckCircle } from "react-icons/fa";

const ClaimNFTPanel = () => {
  const { isApproved, setIsApproved } = useAppState();
  const { data: signer } = useSigner();
  const claimNFT = useContract({
    addressOrName: process.env.NEXT_PUBLIC_CLAIM_ADDRESS || "",
    abi: BloodOfMolochClaimNFT.abi,
    signerOrProvider: signer,
  });
  const [claimNFTBalance, setClaimNFTBalance] = useState<string>("");
  useEffect(() => {
    checkClaimNFTBalance();
    checkIfIsApprovedForAll();
  }, []);

  const approveClaimNFT = async () => {
    if (claimNFT) {
      const tx = await claimNFT.setApprovalForAll(
        process.env.NEXT_PUBLIC_DRINK_NFT_ADDRESS || "",
        true
      );
      const result = await tx.wait();
      console.log(`approve result: ${result}`);
    }
  };

  const checkClaimNFTBalance = async () => {
    if (claimNFT) {
      const tx = await claimNFT.balanceOf(signer?.getAddress());
      const result = await tx.wait();
      console.log(`check balance result ${result}`);
      setClaimNFTBalance(result);
    }
  };

  const checkIfIsApprovedForAll = async () => {
    if (claimNFT) {
      const tx = await claimNFT.isApprovedForAll(
        signer?.getAddress(),
        process.env.NEXT_PUBLIC_CLAIM_ADDRESS || ""
      );
      const result = await tx.wait();
      console.log(`checkIfIsApprovedForAll result: ${result}`);
      setIsApproved(result.data); 
    }
  };

  return (
    <Flex direction="column" m={10}>
      <Text fontSize="16px" as="h2" fontFamily="texturina">
        Step 1. Approve the contract to burn your CLAIM NFT
      </Text>
      <Text>You have {claimNFTBalance} CLAIM NFTs</Text>
      {!isApproved && (
        <Button my={8} onClick={approveClaimNFT}>
          Set Approval to Burn CLAIM NFT
        </Button>
      )}
      {isApproved && (
        <HStack>
          <Text fontSize="2xl" fontFamily="texturina" mr={4}>
            Done
          </Text>
          <Icon as={FaCheckCircle} />
        </HStack>
      )}
    </Flex>
  );
};

export default ClaimNFTPanel;
