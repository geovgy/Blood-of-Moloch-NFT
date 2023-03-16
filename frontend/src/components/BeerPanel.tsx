import { VStack, Heading, Text, Flex, Image } from "@chakra-ui/react";
import BeerInfo from "./BeerInfo";
import copy from "../utils/copy.json";

const BeerPanel = () => {
  return (
    <VStack w={"100%"} py={"1em"} bg="black">
      <Image
        src="/assets/bomba.png"
        alt="blood of moloch beer logo"
        width="26rem"
        my={0}
      />
      <BeerInfo bgColor={"black"} copy={copy["barrel-aged"]} />
    </VStack>
  );
};

export default BeerPanel;
