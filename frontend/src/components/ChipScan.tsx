import { useState, useEffect } from "react";
import { Text, Button, Box, VStack, Flex } from "@chakra-ui/react";
import { useSigner, useAccount, useContract } from "wagmi";
import {
  getPublicKeysFromScan,
  getSignatureFromScan,
} from "pbt-chip-client/kong";
import React from "react";
import DoneIcon from "./DoneIcon";
import { useAppState } from "../context/AppContext";
import Web3 from "web3";
import BloodOfMolochPBT from "../artifacts/contracts/BloodOfMolochPBT.sol/BloodOfMolochPBT.json";
import { Network, Alchemy } from "alchemy-sdk";

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
  network: Network.ETH_GOERLI,
};

const alchemy = new Alchemy(settings);

// Get the latest block
const latestBlock = alchemy.core.getBlockNumber();
const ChipScan = () => {
  const { data: signer } = useSigner();
  const claimTokenId = 0;
  const { address } = useAccount();
  const {
    blockHashUsedInSig,
    setBlockHashUsedInSig,
    signatureFromChip,
    setSignatureFromChip,
    setChipPublicKey,
    chipPublicKey,
  } = useAppState();
  const [drinkNFTBalance, setDrinkNFTBalance] = useState<string>("0");

  console.log(
    `process.env.NEXT_PUBLIC_ALCHEMY_KEY: ${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`
  );

  const getBlockHash = async () => {
    const blockNumber = await alchemy.core.getBlockNumber();

    console.log(`getBlockHash blockNumber: ${blockNumber}`);
    const block = await alchemy.core.getBlock(blockNumber);
    console.log(`block.hash: ${block.hash}`);

    setBlockHashUsedInSig(block.hash);
    return block.hash;
  };

  const bomPBT = useContract({
    address: process.env.NEXT_PUBLIC_PBT_ADDRESS || "",
    abi: BloodOfMolochPBT.abi,
    signerOrProvider: signer,
  });

  useEffect(() => {
    // getBlockHash();
    getOwner();
  }, []);
  useEffect(() => {
    getPBTBalance();
  });

  const getOwner = async () => {
    const tx = await bomPBT?.owner();
    console.log("tx", JSON.stringify(tx));
  };
  const getPBTBalance = async () => {
    const tx = await bomPBT?.balanceOf(address);
    console.log("tx", tx.toString());
    setDrinkNFTBalance(tx.toString());
  };

  const initiateScan = async () => {
    try {
      const currBlockHash = await getBlockHash();
      console.log(`currBlockHash: ${currBlockHash}`);

      const keys = await getPublicKeysFromScan({
        rpId: "raidbrood.xyz",
      });
      setChipPublicKey(keys?.primaryPublicKeyRaw);
      console.log(`Public keys: ${JSON.stringify(keys)}`);
      const sig = await getSignatureFromChip(
        keys?.primaryPublicKeyRaw,
        currBlockHash
      );
      console.log(`sig: ${JSON.stringify(sig)}`);
      mintPBT(sig);
    } catch (e: any) {
      alert(`error: ${JSON.stringify(e)}`);
    }
  };
  const getSignatureFromChip = async (
    publicKey: string,
    currBlockHash: string
  ) => {
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

    alert(` sig: ${JSON.stringify(sig)}`);
    console.log(` sig: ${JSON.stringify(sig)}`);
    return sig;
  };
  const mintPBT = async (sig: string) => {
    const tx = await bomPBT?.mint(
      claimTokenId,
      signatureFromChip,
      blockHashUsedInSig
    );
    console.log("tx", JSON.stringify(tx));

    const receipt = await tx?.wait();
    console.log("mintPBT receipt", JSON.stringify(receipt));
  };

  if (!signer) {
    return null;
  }

  return (
    <VStack>
      <VStack align="center">
        <Text textAlign="center" fontSize="xl" my={6}>
          Press button and bring your phone near your Blood of Moloch KONG chip.
          Then you will be prompted to mint your physically backed token.
        </Text>
        <Text>You own {drinkNFTBalance} Drink NFTs</Text>

        <VStack direction="column">
          <Button
            disabled={!!chipPublicKey}
            onClick={initiateScan}
            fontFamily="texturina"
          >
            Scan Your PBT Chip
          </Button>
        </VStack>
      </VStack>
    </VStack>
  );
};

export default ChipScan;
