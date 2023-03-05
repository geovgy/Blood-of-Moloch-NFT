import { useState, useEffect } from "react";
import { Text, Button, VStack } from "@chakra-ui/react";
import { useSigner, useAccount } from "wagmi";
import {
  getPublicKeysFromScan,
  getSignatureFromScan,
} from "pbt-chip-client/kong";
import React from "react";
import DoneIcon from "./DoneIcon";
import { useAppState } from "../context/AppContext";
import BloodOfMolochPBT from "../artifacts/contracts/BloodOfMolochPBT.sol/BloodOfMolochPBT.json";
import { Network, Alchemy } from "alchemy-sdk";
import { ethers } from "ethers";

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
  network: Network.ETH_GOERLI,
};

const alchemy = new Alchemy(settings);

// Get the latest block
const ChipScan = () => {
  const [bomPBT, setBomPBT] = useState<any>(null);
  const [blockNumber, setBlockNumber] = useState<number>(0);
  const { data: signer } = useSigner();
  const claimTokenId = 3;
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
    getOwner();
  }, []);
  useEffect(() => {
    getPBTBalance();
    getSupply();
  });

  const getOwner = async () => {
    const tx = await bomPBT?.owner();
    console.log("tx", JSON.stringify(tx));
  };
  const getPBTBalance = async () => {
    if (bomPBT) {
      const tx = await bomPBT?.balanceOf(address);
      console.log("tx", tx.toString());
      setDrinkNFTBalance(tx.toString());
    }
  };
  const getSupply = async () => {
    if (bomPBT) {
      const tx = await bomPBT?.supply();
      console.log("supply", tx.toString());
    }
  };

  const initiateScan = async () => {
    try {
      const [currBlockHash, currBlockNumber] = await getBlockHash();
      process.env.NEXT_PUBLIC_DEV_MODE &&
        console.log(
          `currBlockHash: ${currBlockHash} currBlockNumber: ${currBlockNumber}`
        );

      const keys = await getPublicKeysFromScan({
        rpId: "raidbrood.xyz",
      });
      setChipPublicKey(keys?.primaryPublicKeyRaw);
      process.env.NEXT_PUBLIC_DEV_MODE &&
        console.log(`Public keys: ${JSON.stringify(keys)}`);
      const sig = await getSignatureFromChip(
        keys?.primaryPublicKeyRaw,
        currBlockHash
      );
      process.env.NEXT_PUBLIC_DEV_MODE &&
        console.log(`sig: ${JSON.stringify(sig)}`);
      mintPBT(sig, currBlockNumber);
    } catch (e: any) {
      console.error(`error: ${JSON.stringify(e)}`);
    }
  };
  const getSignatureFromChip = async (
    publicKey: string,
    currBlockHash: string
  ) => {
    process.env.NEXT_PUBLIC_DEV_MODE &&
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
    process.env.NEXT_PUBLIC_DEV_MODE &&
      console.log(` sig: ${JSON.stringify(sig)}`);
    return sig;
  };
  const mintPBT = async (sig: string, currBlockNumber: string) => {
    process.env.NEXT_PUBLIC_DEV_MODE &&
      console.log(`mintPBT sig: ${sig} currBlockNumber: ${currBlockNumber}`);

    const tx = await bomPBT?.mint(claimTokenId, sig, currBlockNumber, {
      gasLimit: 10000000,
    });

    process.env.NEXT_PUBLIC_DEV_MODE && console.log("tx", JSON.stringify(tx));

    const receipt = await tx?.wait();
    process.env.NEXT_PUBLIC_DEV_MODE &&
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
