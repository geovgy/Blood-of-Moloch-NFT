import { useState } from "react";
import { Text, Flex, Box } from "@raidguild/design-system";

const ClaimNFTPanel = () => {
  const [claimNFTBalance, setClaimNFTBalance] = useState(0);
  return (
    <Flex direction="column" m={10}>
      <Text fontSize="16px" as="h2" fontFamily="texturina">
        Step 1. Approve the contract to burn your CLAIM NFT
      </Text>
      <Text>You have {claimNFTBalance} CLAIM NFTs</Text>
    </Flex>
  );
};

export default ClaimNFTPanel;
