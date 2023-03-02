import { useState, useEffect } from "react";
import { Text, Button, Box, VStack, Flex } from "@chakra-ui/react";
import { useSigner, useAccount } from "wagmi";
import { getProvider } from "@wagmi/core";

import {
  getPublicKeysFromScan,
  getSignatureFromScan,
} from "pbt-chip-client/kong";
import React from "react";
import DoneIcon from "./DoneIcon";
import { useAppState } from "../context/AppContext";
import Web3Utils from "web3-utils";
import Web3 from "web3";

const ChipScan = () => {
  const web3 = new Web3(Web3.givenProvider || "");
  const { address } = useAccount();
  const provider = getProvider();
  const {
    blockHashUsedInSig,
    setBlockHashUsedInSig,
    signatureFromChip,
    setSignatureFromChip,
    setChipPublicKey,
    chipPublicKey,
  } = useAppState();
  console.log(`blockHashUsedInSig: ${blockHashUsedInSig}`);
  console.log(`(window as any).ethereum: ${typeof (window as any).ethereum}`);

  const getBlockHash = async () => {
    console.log(`inside getBlockHash`, typeof web3);

    const blockNumber = await web3.eth.getBlockNumber();
    const block = await web3.eth.getBlock(blockNumber);
    console.log(`blockNumber: ${JSON.stringify(blockNumber)}`);
    console.log(`block: ${JSON.stringify(block)}`);

    setBlockHashUsedInSig(block.hash);
    console.log(`block.hash: ${block.hash}`);
  };

  useEffect(() => {
    getBlockHash();
    console.log(`inside useEffect`, typeof web3);
  }, []);

  const [keys, setKeys] = useState<any>(null);
  const [sig, setSig] = useState<any>(null);
  const { data: signer } = useSigner();

  console.log(`keys: ${JSON.stringify(keys)} sig: ${JSON.stringify(sig)}`);

  const getPublicKey = () => {
    getPublicKeysFromScan({
      rpId: "raidbrood.xyz",
    }).then((keys: any) => {
      setKeys(keys);
      setChipPublicKey(keys?.primaryPublicKeyRaw);
      console.log(`Public keys: ${JSON.stringify(keys)}`);
      getSignatureFromChip(keys?.primaryPublicKeyRaw);
    });
  };
  const getSignatureFromChip = (publicKey: string) => {
    console.log(
      "inside getSignatureFromChip",
      publicKey,
      address,
      blockHashUsedInSig
    );
    getSignatureFromScan({
      chipPublicKey: publicKey,
      address: address,
      hash: blockHashUsedInSig,
    })
      .then((sig) => {
        setSig(sig);
        setSignatureFromChip(sig);

        alert(` sig: ${JSON.stringify(sig)}`);
        console.log(` sig: ${JSON.stringify(sig)}`);
      })
      .catch((err: any) => {
        console.log(`getSignatureFromScan error: ${JSON.stringify(err)}`);
      });
  };

  if (!signer) {
    return null;
  }

  return (
    <VStack>
      <VStack align="center">
        <Text fontSize="lg" my={6}>
          Part A. Get public key from Chip
        </Text>
        {chipPublicKey && <DoneIcon />}

        <VStack direction="column">
          <Button
            disabled={!!chipPublicKey}
            onClick={getPublicKey}
            fontFamily="texturina"
          >
            Initiate Scan
          </Button>
          <Text fontSize="xs" my={4} color="gray.600">
            This will grab the public key from the chip necessary for the next
            step
          </Text>
        </VStack>
      </VStack>
      <VStack>
        <Text fontSize="lg" my={6}>
          Part B. Get Signature
        </Text>
        {signatureFromChip && <DoneIcon />}
        <Box my={10}>
          <Button
            disabled={!!signatureFromChip}
            onClick={getSignatureFromChip}
            my={10}
          >
            Get Signature from Chip
          </Button>
        </Box>
        {/* <Text fontSize="xs" my={4} color="gray.600">
          This will initiate the chip to sign a message with contents of your
          address: {signer?.getAddress()} and recent block number:{" "}
          {blockHashUsedInSig}
        </Text> */}
      </VStack>
    </VStack>
  );
};

export default ChipScan;
