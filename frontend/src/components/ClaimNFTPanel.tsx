import { useState, useEffect } from "react";
import { Text, Flex, Icon, HStack } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { useSigner, useContract, useAccount } from "wagmi";
import BloodOfMolochClaimNFT from "../artifacts/contracts/BloodOfMolochClaimNFT.sol/BloodOfMolochClaimNFT.json";
import MockERC721 from "../artifacts/contracts/mock/MockERC721.sol/MockERC721.json";
import React from "react";
import { useAppState } from "@/context/AppContext";
import { FaCheckCircle } from "react-icons/fa";

const ClaimNFTPanel = () => {
  const { isApproved, setIsApproved } = useAppState();
  const { data: signer, isSuccess } = useSigner();
  const { address, connector, isConnected } = useAccount()
  const ClaimContract = process.env.NEXT_PUBLIC_DEV_MODE ? MockERC721 : BloodOfMolochClaimNFT;
  const claimNFT = useContract({
    address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    abi: ClaimContract.abi,
    signerOrProvider: signer,
  });

  useEffect(() => {
    if (isSuccess) {
      checkClaimNFTBalance();
      checkIfIsApprovedForAll();
    }
  }, [isSuccess]);

  const [claimNFTBalance, setClaimNFTBalance] = useState<string>("0");

  const approveClaimNFT = async () => {
    if (claimNFT) {
      const tx = await claimNFT.setApprovalForAll(
        process.env.NEXT_PUBLIC_CLAIM_ADDRESS,
        true
      );
    }
  };

  const checkClaimNFTBalance = async () => {
    if (address) {
      const tx = await claimNFT.balanceOf(address);
      const result = tx.toString();
      setClaimNFTBalance(result);
    }
  };

  const checkIfIsApprovedForAll = async () => {
    if (address) {
      const tx = await claimNFT.isApprovedForAll(
        address, // owner
        process.env.NEXT_PUBLIC_CLAIM_ADDRESS // operator
      );
      console.log('is approved for all ', tx);
      setIsApproved(tx);
    }
  };

  return (
    <Flex direction="column" m={10}>
      <Text fontSize="4xl" fontFamily="texturina" mb={6}>
        Step 1. Approve the contract to burn your CLAIM NFT
      </Text>
      <Text>You have {claimNFTBalance} CLAIM NFTs</Text>
      {!isApproved && (
        <Button fontFamily="Texturina" my={8} onClick={approveClaimNFT}>
          Set Approval to Burn CLAIM NFT
        </Button>
      )}
      {isApproved ? <Text>Approved to Burn</Text> : <Text>Not Approved</Text>}
      {isApproved && (
        <HStack>
          <Text fontSize="2xl" fontFamily="texturina" mr={4}>
            Done
          </Text>
          <Icon as={FaCheckCircle} />
        </HStack>
      )}
      {/* // todo: display Claim NFT image */}
    </Flex>
  );
};

export default ClaimNFTPanel;
