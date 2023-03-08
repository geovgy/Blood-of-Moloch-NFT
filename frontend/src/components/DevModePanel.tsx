import { useEffect, useState } from "react";
import { useSigner, useAccount } from "wagmi";
import { ethers } from "ethers";
import EthCrypto from "eth-crypto";
import { Button, Text, Flex } from "@chakra-ui/react";
import ClaimNFT from "../artifacts/contracts/BloodOfMolochClaimNFT.sol/BloodOfMolochClaimNFT.json";
import BloodOfMolochPBT from "../artifacts/contracts/BloodOfMolochPBT.sol/BloodOfMolochPBT.json";
import getWalletClaimNFTs from "../utils/api";

const DevModePanel = () => {
  const { data: signer } = useSigner();
  const [claimNFT, setClaimNFT] = useState<any>(null);
  const [bomPBT, setBomPBT] = useState<any>(null);
  const [chipAddress, setChipAddress] = useState<string>("");
  const { address } = useAccount();
  const initContracts = () => {
    setClaimNFT(
      new ethers.Contract(
        process.env.NEXT_PUBLIC_CLAIM_ADDRESS || "",
        ClaimNFT.abi,
        signer
      )
    );
    setBomPBT(
      new ethers.Contract(
        process.env.NEXT_PUBLIC_PBT_ADDRESS || "",
        BloodOfMolochPBT.abi,
        signer
      )
    );
  };

  useEffect(() => {
    getAddress();
  }, []);
  useEffect(() => {
    initContracts();
  }, [signer]);

  const mintClaimFT = async () => {
    const tx = await claimNFT?.batchMint(10);
    const result = await tx.wait();
    console.log(`mint result: ${JSON.stringify(result)}`);
  };
  const getTokenOfOwner = async () => {
    const result = getWalletClaimNFTs(address);
    console.log(`getWalletClaimNFTs result: ${JSON.stringify(result)}`);
  };

  const primaryPublicKeyRaw =
    "04bd0a24bbfc3bcd1586a5d02a0c8190330a097aef1dd08deb665bf63cc98b228e2da269970789bbef7d39439cfd6d2ec8576065cd40aaf8810e7f0ef70462e5f4";

  const getAddress = () => {
    const chipAddress = EthCrypto.publicKey.toAddress(primaryPublicKeyRaw);
    console.log(`chipAddress: ${chipAddress}`);
    setChipAddress(chipAddress);
  };
  const seedPBT = async () => {
    const tx = await bomPBT?.seedChipToTokenMapping([chipAddress], [1], false);
    const result = await tx.wait();
    console.log(`seedChipToTokenMapping result: ${JSON.stringify(result)}`);
  };

  const getPBTBalance = async () => {
    const tx = await bomPBT?.balanceOf(address);
    console.log(`getPBTBalance tx: ${tx.toString()}`);
  };

  const openMint = async () => {
    const tx = await bomPBT?.openMint();

    console.log("openMint tx", JSON.stringify(tx));
    const receipt = await tx?.wait();
    console.log("receipt", JSON.stringify(receipt));
  };
  const setBaseURI = async () => {
    const tx = await bomPBT?.setBaseURI("https://broodraid.xyz/assets/babom/");

    console.log("openMint tx", JSON.stringify(tx));
    const receipt = await tx?.wait();
    console.log("receipt", JSON.stringify(receipt));
  };

  const setClaimToken = async () => {
    const tx = await bomPBT?.setClaimToken(
      process.env.NEXT_PUBLIC_CLAIM_ADDRESS
    );

    console.log("setClaimToken tx", JSON.stringify(tx));
    const receipt = await tx?.wait();
    console.log("receipt", JSON.stringify(receipt));
  };
  return (
    <Flex
      border="solid 1px pink"
      borderRadius="12px"
      p={4}
      direction="column"
      align="center"
      justify="center"
      width="100%"
    >
      <Text>Dev Mode Panel</Text>
      <Flex flexWrap="wrap">
        <Button m={4} onClick={mintClaimFT}>
          Mint Claim NFT
        </Button>
        <Button m={4} onClick={getTokenOfOwner}>
          Get Token of Owner
        </Button>
        <Button m={4} onClick={seedPBT}>
          Seed PBT
        </Button>
        <Button m={4} onClick={getPBTBalance}>
          getPBTBalance
        </Button>
        <Button m={4} onClick={openMint}>
          openMint
        </Button>
        <Button m={4} onClick={setBaseURI}>
          setBaseURI
        </Button>
        <Button m={4} onClick={setClaimToken}>
          setClaimToken
        </Button>
      </Flex>
    </Flex>
  );
};

export default DevModePanel;
