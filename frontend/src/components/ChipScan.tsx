import { useState, useEffect } from "react";
import { Text, Button, Box, VStack, Flex } from "@chakra-ui/react";
import { useBlockNumber, useSigner, useAccount } from "wagmi";
import {
  getPublicKeysFromScan,
  getSignatureFromScan,
} from "pbt-chip-client/kong";
import React from "react";
import DoneIcon from "./DoneIcon";
import { useAppState } from "../context/AppContext";

const ChipScan = () => {
  const { address } = useAccount();
  const {
    blockNumberUsedInSig,
    setBlockNumberUsedInSig,
    signatureFromChip,
    setSignatureFromChip,
    setChipPublicKey,
    chipPublicKey,
  } = useAppState();
  const [blockNumber, setBlockNumber] = useState<string>("");
  const [keys, setKeys] = useState<any>(null);
  const [sig, setSig] = useState<any>(null);
  const {
    data: blockNumberData,
    isLoading,
    error,
    refetch,
  } = useBlockNumber({
    enabled: false,
  });
  const { data: signer } = useSigner();
  useEffect(() => {
    if (!blockNumberUsedInSig && blockNumberData) {
      console.log(`block number data: ${blockNumberData}`);
      setBlockNumberUsedInSig(blockNumberData);
    }
  }, [blockNumberData]);

  console.log(`keys: ${keys} sig: ${sig}`);
  console.log(`blockNumber: ${blockNumberData} `);

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
            onClick={() => {
              getPublicKeysFromScan().then((keys: any) => {
                setKeys(keys);
                setChipPublicKey(keys?.primaryPublicKeyRaw);
              });
            }}
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
            onClick={() => {
              getSignatureFromScan({
                chipPublicKey: keys?.primaryPublicKeyRaw,
                address: address,
                hash: blockNumberUsedInSig,
              }).then((sig) => {
                setSig(sig);
                setSignatureFromChip(sig);
              });
            }}
            my={10}
          >
            Get Signature from Chip
          </Button>
        </Box>
        {/* <Text fontSize="xs" my={4} color="gray.600">
          This will initiate the chip to sign a message with contents of your
          address: {signer?.getAddress()} and recent block number:{" "}
          {blockNumberUsedInSig}
        </Text> */}
      </VStack>
    </VStack>
  );
};

export default ChipScan;
