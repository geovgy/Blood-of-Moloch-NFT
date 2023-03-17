import { VStack, Image } from "@chakra-ui/react";
import BeerInfo from "./BeerInfo";
import copy from "../utils/copy.json";

const BeerPanel = () => {
  return (
    <VStack w={"100%"} py={"1em"} bg="black">
      <BeerInfo bgColor={"black"} copy={copy["barrel-aged"]} />
    </VStack>
  );
};

export default BeerPanel;
