import { useState, useEffect } from "react";
import { Text, Button, Box, VStack, Flex } from "@chakra-ui/react";
import { useSigner, useAccount } from "wagmi";
import {
  getPublicKeysFromScan,
  getSignatureFromScan,
} from "pbt-chip-client/kong";
import React from "react";
import DoneIcon from "./DoneIcon";
import { useAppState } from "../context/AppContext";
import Web3 from "web3";

const ChipScan = () => {
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const {
    blockHashUsedInSig,
    setBlockHashUsedInSig,
    signatureFromChip,
    setSignatureFromChip,
    setChipPublicKey,
    chipPublicKey,
  } = useAppState();

  const web3 = new Web3("https://cloudflare-eth.com");

  const getBlockHash = async () => {
    const blockNumber = await web3.eth.getBlockNumber();
    const block = await web3.eth.getBlock(blockNumber);
    setBlockHashUsedInSig(block.hash);
  };

  useEffect(() => {
    getBlockHash();
  }, []);

  const [keys, setKeys] = useState<any>(null);
  const [sig, setSig] = useState<any>(null);
  const initiateScan = () => {
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
            onClick={initiateScan}
            fontFamily="texturina"
          >
            Scan Your PBT Chip
          </Button>
          <Text fontSize="xs" my={4} color="gray.600">
            This will grab the public key from the chip necessary for the next
            step
          </Text>
        </VStack>
      </VStack>
      <VStack>
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
