import { VStack, Text } from "@chakra-ui/react";

const ReceiveBeer = () => {
  return (
    <VStack my={20}>
      <VStack mb={20}>
        <Text fontFamily="texturina" textAlign="center" fontSize="4xl">
          Receive your Beer
        </Text>
        <Text
          fontFamily="texturina"
          fontSize="lg"
          textAlign="center"
          fontSize="sm"
        >
          (currently only shipping within the United States)
        </Text>
      </VStack>
      <Text fontFamily="texturina" fontSize="lg" textAlign="center">
        Fill the form below to receive your Barrel Aged Blood
      </Text>
      <Text fontFamily="texturina" fontSize="lg" textAlign="center">
        Note: CLAIM NFT's entered into the form below are marked as redeemed. To
        mint the DRINK NFT and receive shares, user must hold CLAIM NFT in
        wallet and a Barrel Aged Blood of Moloch Kong Chip in hand
      </Text>
    </VStack>
  );
};

export default ReceiveBeer;
