import { useSigner, useContract, useAccount } from "wagmi";
import { Button } from "@chakra-ui/react";
import ClaimNFT from "../artifacts/contracts/BloodOfMolochClaimNFT.sol/BloodOfMolochClaimNFT.json";
import getWalletClaimNFTs from "../utils/api";
const MintClaimNFT = () => {
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const claimNFT = useContract({
    address: process.env.NEXT_PUBLIC_CLAIM_ADDRESS || "",
    abi: ClaimNFT.abi,
    signerOrProvider: signer,
  });
  const mintClaimFT = async () => {
    const tx = await claimNFT?.batchMint(10);
    const result = await tx.wait();
    console.log(`mint result: ${JSON.stringify(result)}`);
  };
  const getTokenOfOwner = async () => {
    const result = getWalletClaimNFTs(address);
    console.log(`getWalletClaimNFTs result: ${JSON.stringify(result)}`);
  };
  return (
    <div>
      <Button onClick={mintClaimFT}>Mint Mock NFT</Button>
      <Button onClick={getTokenOfOwner}>Get Token of Owner</Button>
    </div>
  );
};

export default MintClaimNFT;
