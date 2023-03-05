import { useState, useEffect } from "react";
import { Text, Flex } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { useSigner, useAccount } from "wagmi";
import BloodOfMolochClaimNFT from "../artifacts/contracts/BloodOfMolochClaimNFT.sol/BloodOfMolochClaimNFT.json";
import MockERC721 from "../artifacts/contracts/mock/MockERC721.sol/MockERC721.json";
import React from "react";
import { ethers } from "ethers";
import { useAppState } from "@/context/AppContext";
import { FaCheckCircle } from "react-icons/fa";

const ClaimNFTPanel = () => {
  const { isApproved, setIsApproved } = useAppState();
  const [claimNFT, setClaimNFT] = useState<any>(null);
  const { data: signer, isSuccess } = useSigner();
  const { address } = useAccount();
  const ClaimContract = process.env.NEXT_PUBLIC_DEV_MODE
    ? MockERC721
    : BloodOfMolochClaimNFT;

  const initContracts = () => {
    setClaimNFT(
      new ethers.Contract(
        process.env.NEXT_PUBLIC_CLAIM_ADDRESS || "",
        BloodOfMolochClaimNFT.abi,
        signer
      )
    );
  };

  useEffect(() => {
    if (isSuccess) {
      initContracts();
    }
  }, [isSuccess]);
  useEffect(() => {
    if (claimNFT) {
      checkClaimNFTBalance();
      getTokenURI();
    }
  }, [claimNFT]);

  const [claimNFTBalance, setClaimNFTBalance] = useState<string>("0");

  const checkClaimNFTBalance = async () => {
    const tx = await claimNFT.balanceOf(address);
    const result = tx.toString();
    setClaimNFTBalance(result);
  };

  const getTokenURI = async () => {
    if (address && claimNFT) {
      const tx = await claimNFT.tokenURI(2);
      console.log("getTokenURI claimNFT tx: ", tx.toString());
    }
  };

  const mintClaimNFT = async () => {
    const options = { value: ethers.utils.parseEther("0.05") };
    const tx = await claimNFT?.mint(options);
    const result = await tx.wait();
    console.log(`mint result: ${JSON.stringify(result)}`);
  };

  return (
    <Flex direction="column" m={10}>
      <Text fontSize="xl" textAlign="center" fontFamily="texturina" mb={6}>
        Mint your CLAIM NFT
      </Text>
      <Text textAlign="center">You have {claimNFTBalance} CLAIM NFTs</Text>
      <Button fontFamily="texturina" my={8} onClick={mintClaimNFT}>
        Mint for 0.05 ETH
      </Button>
    </Flex>
  );
};

export default ClaimNFTPanel;
