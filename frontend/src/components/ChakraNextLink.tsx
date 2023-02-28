/* eslint-disable react/jsx-props-no-spreading */
import { Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";

const ChakraNextLink = ({ href, children, ...props }: any) => (
  <NextLink href={href} passHref>
    <ChakraLink {...props}>{children}</ChakraLink>
  </NextLink>
);

export default ChakraNextLink;
