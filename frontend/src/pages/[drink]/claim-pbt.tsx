import { useState, useEffect } from "react";
import { Container, VStack, Flex, Text } from "@chakra-ui/react";
import { useContractRead, useAccount, useBalance, useSignMessage } from "wagmi";
import React from "react";
import ChipScan from "@/components/ChipScan";
import { useRouter } from "next/router";
import ErrorPage from "next/error";
import ClaimNFTPanel from "@/components/ClaimNFTPanel";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import BeerPanel from "@/components/BeerPanel";
import LogoHeader from "@/components/LogoHeader";
import ReceiveBeer from "@/components/ReceiveBeer";
import Label from "@/components/Label";
import { verifyMessage } from "ethers/lib/utils.js";
import { BigNumber } from "ethers";
import BloodOfMolochClaimNFT from "../../artifacts/contracts/BloodOfMolochClaimNFT.sol/BloodOfMolochClaimNFT.json";

const message =
  "This signature verifies you own the account you are claiming from.";

export default function ClaimBaBom() {
  const { address, isConnected } = useAccount();
  const [canOpenForm, setCanOpenForm] = useState(false);

  const [is404, setIs404] = useState(false);
  const [_isConnected, _setIsConnected] = useState(false);
  const { data: claimNFTBalance } = useContractRead({
    abi: BloodOfMolochClaimNFT.abi,
    address: process.env.NEXT_PUBLIC_CLAIM_ADDRESS as `0x${string}`,
    args: [address],
    functionName: "balanceOf",
  });

  const onSignSuccess = (data, variables) => {
    const balance = claimNFTBalance || BigNumber.from(0);
    const signedAddress = verifyMessage(variables.message, data);
    setCanOpenForm(address === signedAddress && balance.gt(0));
  };
  const onSignError = () => {
    setCanOpenForm(false);
  };
  const { signMessage } = useSignMessage({
    message,
    onSuccess: onSignSuccess,
    onError: onSignError,
  });

  const router = useRouter();
  // this fixes issue with NextJS: Error: Hydration failed
  useEffect(() => {
    _setIsConnected(isConnected);
  }, [isConnected]);
  useEffect(() => {
    if (router.query.drink && router.query.drink !== "babom") {
      setIs404(true);
    }
  }, [router.query.drink]);
  if (is404) {
    return <ErrorPage statusCode={404} />;
  }
  if (process.env.NEXT_PUBLIC_DISABLED === "true") {
    return (
      <Container>
        <Flex direction="column" align="center" justify="center" m={8}>
          <Text>Mint is not open yet, check back soon.</Text>
        </Flex>
      </Container>
    );
  }

  return (
    <>
      <LogoHeader path={`/assets/babom.png`} />
      <Hero />
      <BeerPanel />

      {!_isConnected && (
        <Flex direction="column" align="center" justify="center" m={8}>
          <Text fontSize="28px" as="h1" fontFamily="texturina">
            Connect your wallet to claim your PBT
          </Text>
        </Flex>
      )}
      {_isConnected && <ClaimNFTPanel />}
      <ReceiveBeer
        canOpenForm={canOpenForm}
        signMessage={signMessage}
        balance={claimNFTBalance}
      />
      {_isConnected && <ChipScan />}
      <Label path={`/assets/babom-label-sm.png`} bgColor={"black"} />
      <Footer />
    </>
  );
}
