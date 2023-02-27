import { useState, useEffect } from "react";
import { Button, Text } from "@raidguild/design-system";
import { useBlockNumber, useSigner } from "wagmi";
import {
  getPublicKeysFromScan,
  getSignatureFromScan,
} from "pbt-chip-client/kong";
import React from "react";
import { useAppState } from "../context/AppState";

const ChipScan = () => {
  const { blockNumberUsedInSig, setBlockNumberUsedInSig, signatureFromChip, setSignatureFromChip, setChipPublicKey } = useAppState();
  const [blockNumber, setBlockNumber] = useState<string>("");
  const [keys, setKeys] = useState<any>(null);
  const [sig, setSig] = useState<any>(null);
  const { data: blockNumberData, isLoading, error, refetch } = useBlockNumber({
    enabled: false,
  });
  const { data: signer } = useSigner();
  useEffect(() => {
    if (!blockNumberUsedInSig && blockNumberData) {
      console.log(`block number data: ${blockNumberData}`);
    }
  }, [blockNumberData]);

  console.log(`keys: ${keys} sig: ${sig}`);
  console.log(`blockNumber: ${blockNumberData} `);

  if (!signer) {
    return null;
  }
  return (
    <>
      {!keys && (
        <Button
          onClick={() => {
            getPublicKeysFromScan().then((keys: any) => {
              setKeys(keys);
              setChipPublicKey(keys?.primaryPublicKeyRaw);
            });
          }}
          mb={8}
          fontFamily="texturina"
        >
          Click Me To Initiate Scan
        </Button>
      )}
      {keys && (
        <Button
          onClick={() => {
            getSignatureFromScan({
              chipPublicKey: keys?.primaryPublicKeyRaw,
              address: signer?.getAddress(),
              hash: blockNumberUsedInSig,
            }).then((sig) => {
              setSig(sig);
              setSignatureFromChip(sig);
            });
          }}
        >
          <Text fontFamily="texturina">
            Click Me To Sign EOA+blockhash w/ Chip
          </Text>
        </Button>
      )}
    </>
  );
};

export default ChipScan;
