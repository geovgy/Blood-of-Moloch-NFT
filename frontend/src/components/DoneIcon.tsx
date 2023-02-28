import React from "react";
import { HStack, Text, Icon } from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";

const DoneIcon = () => {
  return (
    <HStack>
      <Text fontSize="2xl" fontFamily="texturina" mr={4}>
        Done
      </Text>
      <Icon as={FaCheckCircle} />
    </HStack>
  );
};

export default DoneIcon;
