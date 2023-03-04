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

const ChipScan = () => {
  const { data: signer } = useSigner();
  const claimTokenId = 1;
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
    console.log(`blockNumber: ${blockNumber}`);

    const block = await web3.eth.getBlock(blockNumber);
    console.log(`block: ${block}`);

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

  const [keys, setKeys] = useState<any>(null);
  const [sig, setSig] = useState<any>(null);

  const getOwner = async () => {
    const tx = await bomPBT?.owner();
    console.log("tx", JSON.stringify(tx));
  };

  const initiateScan = async () => {
    try {
      const currBlockHash = await getBlockHash();
      console.log(`currBlockHash: ${currBlockHash}`);

      const keys = await getPublicKeysFromScan({
        rpId: "raidbrood.xyz",
      });
      setKeys(keys);
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

    setSig(sig);
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
    console.log("receipt", JSON.stringify(receipt));
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

        <VStack direction="column">
          <Button
            disabled={!!chipPublicKey}
            onClick={initiateScan}
            fontFamily="texturina"
          >
            Scan Your PBT Chip
          </Button>
          {/* <Text fontSize="xs" my={4} color="gray.600">
            This will grab the public key from the chip necessary for the next
            step
          </Text> */}
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
