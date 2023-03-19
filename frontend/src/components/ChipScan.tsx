import { useState, useEffect } from "react";
import {
  Text,
  Flex,
  VStack,
  Button,
  Box,
  Image,
  Container,
} from "@chakra-ui/react";
import { useSigner, useAccount } from "wagmi";
import {
  getPublicKeysFromScan,
  getSignatureFromScan,
} from "pbt-chip-client/kong";
import React from "react";
import { useAppState } from "../context/AppContext";
import BloodOfMolochPBT from "../artifacts/contracts/BloodOfMolochPBT.sol/BloodOfMolochPBT.json";
import { Network, Alchemy } from "alchemy-sdk";
import { ethers } from "ethers";
import { toast } from "react-toastify";

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
  network: Network.ETH_GOERLI,
};

const alchemy = new Alchemy(settings);

// Get the latest block
const ChipScan = () => {
  const [bomPBT, setBomPBT] = useState<any>(null);
  const [claimNFTTokenId, setClaimNFTTokenId] = useState<string>("");
  const [blockNumber, setBlockNumber] = useState<number>(0);
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const {
    setBlockHashUsedInSig,
    setSignatureFromChip,
    setChipPublicKey,
    chipPublicKey,
  } = useAppState();
  const [drinkNFTBalance, setDrinkNFTBalance] = useState<string>("0");

  const getBlockHash = async () => {
    const currBlockNumber = await alchemy.core.getBlockNumber();

    const block = await alchemy.core.getBlock(blockNumber);
    setBlockHashUsedInSig(block.hash);
    setBlockNumber(currBlockNumber);
    return [block.hash, currBlockNumber];
  };

  const initContracts = () => {
    setBomPBT(
      new ethers.Contract(
        process.env.NEXT_PUBLIC_PBT_ADDRESS || "",
        BloodOfMolochPBT.abi,
        signer
      )
    );
  };

  useEffect(() => {
    if (signer) {
      initContracts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer]);

  useEffect(() => {
    getBlockHash();
  }, []);
  useEffect(() => {
    getNFTsOfWallet();
  });
  useEffect(() => {
    getPBTBalance();
  }, [bomPBT]);

  const getNFTsOfWallet = async () => {
    if (claimNFTTokenId) {
      return;
    }

    if (address) {
      const nfts = await alchemy.nft.getNftsForOwner(address);
      const ownedNFT: any = nfts.ownedNfts.find((nft: any) => {
        return (
          nft.contract.address ===
          process.env.NEXT_PUBLIC_CLAIM_ADDRESS?.toLowerCase()
        );
      });

      if (ownedNFT) {
        process.env.NEXT_PUBLIC_DEV_MODE === "true" &&
          console.log(`ownedNFT: ${JSON.stringify(ownedNFT?.tokenId)}`);

        setClaimNFTTokenId(ownedNFT?.tokenId);
      }
    }
  };

  const getPBTBalance = async () => {
    if (bomPBT) {
      const tx = await bomPBT?.balanceOf(address);
      setDrinkNFTBalance(tx.toString());
    }
  };

  const initiateScan = async () => {
    if (!claimNFTTokenId) {
      toast.warning("You must own 1 Claim NFT to mint", {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }
    try {
      const [currBlockHash, currBlockNumber] = await getBlockHash();
      process.env.NEXT_PUBLIC_DEV_MODE === "true" &&
        console.log(
          `currBlockHash: ${currBlockHash} currBlockNumber: ${currBlockNumber}`
        );

      const keys = await getPublicKeysFromScan({
        rpId: "raidbrood.xyz",
      });
      setChipPublicKey(keys?.primaryPublicKeyRaw);
      process.env.NEXT_PUBLIC_DEV_MODE === "true" &&
        console.log(`Public keys: ${JSON.stringify(keys)}`);
      const sig = await getSignatureFromChip(
        keys?.primaryPublicKeyRaw,
        currBlockHash
      );

      process.env.NEXT_PUBLIC_DEV_MODE === "true" &&
        console.log(`sig: ${JSON.stringify(sig)}`);
      mintPBT(sig, currBlockNumber);
    } catch (e: any) {
      console.error(`error: ${e}`);
      toast.warning("Oops! There was an error", {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }
  };
  const getSignatureFromChip = async (
    publicKey: string,
    currBlockHash: string
  ) => {
    process.env.NEXT_PUBLIC_DEV_MODE === "true" &&
      console.log(
        "inside getSignatureFromChip",
        publicKey,
        address,
        currBlockHash
      );
    const sig = await getSignatureFromScan({
      chipPublicKey: publicKey,
      address: address,
      hash: currBlockHash,
    });

    setSignatureFromChip(sig);
    process.env.NEXT_PUBLIC_DEV_MODE === "true" &&
      console.log(` sig: ${JSON.stringify(sig)}`);
    return sig;
  };
  const mintPBT = async (sig: string, currBlockNumber: string) => {
    process.env.NEXT_PUBLIC_DEV_MODE === "true" &&
      console.log(`mintPBT sig: ${sig} currBlockNumber: ${currBlockNumber}`);

    const tx = await bomPBT?.mint(claimNFTTokenId, sig, currBlockNumber, {
      gasLimit: 10000000,
    });

    process.env.NEXT_PUBLIC_DEV_MODE === "true" &&
      console.log("tx", JSON.stringify(tx));

    const receipt = await tx?.wait();
    process.env.NEXT_PUBLIC_DEV_MODE === "true" &&
      console.log("mintPBT receipt", JSON.stringify(receipt));
    toast.success("Successfully minted Drink NFT!", {
      position: "top-right",
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  if (!signer) {
    return null;
  }
  process.env.NEXT_PUBLIC_DEV_MODE === "true" &&
    console.log(
      `process.env.NEXT_PUBLIC_CLAIM_ADDRESS: ${process.env.NEXT_PUBLIC_CLAIM_ADDRESS}`
    );
  process.env.NEXT_PUBLIC_DEV_MODE === "true" &&
    console.log(
      `process.env.NEXT_PUBLIC_PBT_ADDRESS: ${process.env.NEXT_PUBLIC_PBT_ADDRESS}`
    );

  return (
    <Box p={10} minH={"90vh"} backgroundColor="#2b2c34">
      <Container>
        <Flex direction="column" alignItems="center">
          <Text
            id="mint-drink-nft"
            fontSize="4xl"
            textAlign="center"
            fontFamily="texturina"
            mt={4}
          >
            Mint Your Drink PBT
          </Text>
          <VStack my={6} maxWidth="400px">
            <Text fontFamily="texturina" fontSize="18px">
              Remove wax seal from the Blood of Moloch can and expose
              foil-wrapped KONG chip.
            </Text>
            <Text fontFamily="texturina" fontSize="24px">
              •
            </Text>
            <Text fontFamily="texturina" fontSize="18px">
              Bring your phone near your chip and tap “scan” below.
            </Text>
            <Text fontFamily="texturina" fontSize="24px">
              •
            </Text>
            <Text fontFamily="texturina" fontSize="18px">
              Sign the transaction to burn your CLAIM NFT and mint your DRINK
              NFT
            </Text>
          </VStack>
          <Flex
            justifyContent="center"
            alignItems="center"
            direction="column"
            height="100px"
            mb={"10px"}
          >
            <Button
              disabled={!!chipPublicKey}
              onClick={initiateScan}
              fontFamily="texturina"
              _hover={{ bg: "#ff3864", color: "white" }}
            >
              Scan Your PBT Chip
            </Button>
          </Flex>
          <Flex height="100%" mt={2}>
            <Box height={"308px"}>
              <Image
                borderRadius="xl"
                src="/assets/drink-nft.png"
                width="300px"
                height="300px"
                alt="A color graphic of a drink"
                border="solid 1px white"
                style={{
                  transition: "all 100ms ease-in-out",
                }}
                _hover={{
                  transform: "scale(1.04)",
                }}
              />
            </Box>
          </Flex>
          <Text fontSize="lg" my={6} fontFamily="texturina">
            You own {drinkNFTBalance} Drink NFT
            <span>{drinkNFTBalance === "1" ? "" : "s"}</span>
          </Text>
        </Flex>
      </Container>
    </Box>
  );
};

export default ChipScan;
