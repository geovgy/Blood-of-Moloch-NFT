import { useEffect, useState } from "react";
import { useSigner, useContract, useAccount } from "wagmi";
import EthCrypto from "eth-crypto";
import { Button, Text } from "@chakra-ui/react";
import ClaimNFT from "../artifacts/contracts/BloodOfMolochClaimNFT.sol/BloodOfMolochClaimNFT.json";
import BloodOfMolochPBT from "../artifacts/contracts/BloodOfMolochPBT.sol/BloodOfMolochPBT.json";
import getWalletClaimNFTs from "../utils/api";

const MintClaimNFT = () => {
  const { data: signer } = useSigner();
  const [chipAddress, setChipAddress] = useState<string>("");
  const { address } = useAccount();
  const claimNFT = useContract({
    address: process.env.NEXT_PUBLIC_CLAIM_ADDRESS || "",
    abi: ClaimNFT.abi,
    signerOrProvider: signer,
  });
  const bomPBT = useContract({
    address: process.env.NEXT_PUBLIC_PBT_ADDRESS || "",
    abi: BloodOfMolochPBT.abi,
    signerOrProvider: signer,
  });

  useEffect(() => {
    getAddress();
  }, []);

  const mintClaimFT = async () => {
    const tx = await claimNFT?.batchMint(10);
    const result = await tx.wait();
    console.log(`mint result: ${JSON.stringify(result)}`);
  };
  const getTokenOfOwner = async () => {
    const result = getWalletClaimNFTs(address);
    console.log(`getWalletClaimNFTs result: ${JSON.stringify(result)}`);
  };

  const primaryPublicKeyHash =
    "0xa02a09aeb3b6be84ccaecfb052621dbf36a46a98b92695c9744e8b94f9332030";
  const primaryPublicKeyRaw =
    "04bd0a24bbfc3bcd1586a5d02a0c8190330a097aef1dd08deb665bf63cc98b228e2da269970789bbef7d39439cfd6d2ec8576065cd40aaf8810e7f0ef70462e5f4";

  const getAddress = () => {
    const chipAddress = EthCrypto.publicKey.toAddress(primaryPublicKeyRaw);
    // const chipAddress = web3.utils.soliditySha3(primaryPublicKeyRaw);
    console.log(`chipAddress: ${chipAddress}`);
    setChipAddress(chipAddress);
  };
  const seedPBT = async () => {
    const tx = await bomPBT?.seedChipToTokenMapping([chipAddress], [1], false);
    const result = await tx.wait();
    console.log(`seedChipToTokenMapping result: ${JSON.stringify(result)}`);
  };

  const getPBTBalance = async () => {
    debugger;
    const tx = await bomPBT?.balanceOf(address);
    console.log(`getPBTBalance tx: ${tx.toString()}`);
    // const result = await tx.wait();
    // console.log(`getPBTBalance result: ${JSON.stringify(result)}`);
    // return JSON.stringify(result);
  };

  return (
    <div>
      <Button onClick={mintClaimFT}>Mint Mock NFT</Button>
      <Button onClick={getTokenOfOwner}>Get Token of Owner</Button>
      <Button onClick={seedPBT}>Seed PBT</Button>
      <Button onClick={getPBTBalance}>getPBTBalance</Button>
      <Text> chip address: {chipAddress}</Text>
      <Text>{/* balance of PBT: <p>{getPBTBalance()}</p> */}</Text>
    </div>
  );
};

export default MintClaimNFT;
