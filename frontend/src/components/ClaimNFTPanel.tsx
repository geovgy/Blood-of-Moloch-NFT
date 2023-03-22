import { useState, useEffect } from "react";
import {
  Button,
  Box,
  Text,
  Flex,
  Image,
  Container,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useSigner, useAccount } from "wagmi";
import BloodOfMolochClaimNFT from "../artifacts/contracts/BloodOfMolochClaimNFT.sol/BloodOfMolochClaimNFT.json";
import React from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";

const ClaimNFTPanel = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [claimNFT, setClaimNFT] = useState<any>(null);
  const { data: signer, isSuccess } = useSigner();
  const { address } = useAccount();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);
  useEffect(() => {
    if (claimNFT) {
      checkClaimNFTBalance();
      // getTokenURI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    }
  };

  const mintClaimNFT = async () => {
    try {
      const options = { value: ethers.utils.parseEther("0.069") };
      const tx = await claimNFT?.mintClaimToken(options);
      const result = await tx.wait();
      console.log(`mint result: ${JSON.stringify(result)}`);
      toast.success("Successfully minted Claim NFT!", {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } catch (err: any) {
      console.error(err);
      toast.warning(`Oops! There was an error. Message: ${err.message}`, {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  return (
    <Box p={10} minH={"90vh"} backgroundColor="#2b2c34">
      <Container>
        <Flex direction="column" alignItems="center">
          <Text
            id="mint-claim-nft"
            fontSize="4xl"
            textAlign="center"
            fontFamily="texturina"
            mb={6}
            mt={8}
          >
            Mint your CLAIM NFT
          </Text>
          <Text my={4} fontFamily="texturina" fontSize="lg" textAlign="center">
            Minting this NFT is your claim to the Barrel Aged Blood of Moloch,
            each NFT is good for one 16oz bourbon-barrel-aged imperial stout
          </Text>
          <Text my={4} fontFamily="texturina" fontSize="lg" textAlign="center">
            Note: CLAIM NFT&apos;s may be sold/traded/transferred until they are
            use to claim a can of Blood
          </Text>
          <Button
            fontFamily="texturina"
            my={8}
            onClick={mintClaimNFT}
            _hover={{ bg: "#ff3864", color: "white" }}
          >
            Mint for 0.069 ETH
          </Button>
          <Flex height={"308px"}>
            <Image
              borderRadius="xl"
              src="/assets/claim-nft.png"
              width="300px"
              height="300px"
              border="solid 1px white"
              alt="Graphic of a drink in black and white"
              style={{
                transition: "all 100ms ease-in-out",
              }}
              _hover={{
                transform: "scale(1.04)",
              }}
            />
          </Flex>
          <Text
            textAlign="center"
            fontFamily="texturina"
            fontSize="lg"
            my="8"
            // onClick={onOpen}
          >
            You own {claimNFTBalance} CLAIM NFT
            <span>{claimNFTBalance === "1" ? "" : "s"}</span>
          </Text>
        </Flex>
      </Container>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="texturina">Your Claim NFTs</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>this is the body</Text>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ClaimNFTPanel;
