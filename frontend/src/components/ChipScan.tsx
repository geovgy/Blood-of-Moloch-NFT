import { useState } from "react";
import { Button, Text } from "@raidguild/design-system";
import {
  getPublicKeysFromScan,
  getSignatureFromScan,
} from "pbt-chip-client/kong";

const ChipScan = () => {
  const [keys, setKeys] = useState<any>(null);
  const [sig, setSig] = useState<any>(null);

  console.log(`keys: ${keys} sig: ${sig}`);

  return (
    <>
      <Button
        onClick={() => {
          getPublicKeysFromScan().then((keys: any) => {
            setKeys(keys);
          });
        }}
        mb={8}
        fontFamily="texturina"
      >
        Click Me To Initiate Scan
      </Button>
      <Button
        onClick={() => {
          getSignatureFromScan({
            chipPublicKey: keys?.primaryPublicKeyRaw,
            address: "<user_eth_address>",
            hash: "<blockhash>",
          }).then((sig) => {
            setSig(sig);
          });
        }}
      >
        <Text fontFamily="texturina">
          Click Me To Sign EOA+blockhash w/ Chip
        </Text>
      </Button>
    </>
  );
};

export default ChipScan;
