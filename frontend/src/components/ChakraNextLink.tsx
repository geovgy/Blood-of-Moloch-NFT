/* eslint-disable react/jsx-props-no-spreading */
import { Link as ChakraLink } from "@raidguild/design-system";
import NextLink from "next/link";

const ChakraNextLink = ({ href, children, ...props }: any) => (
  <NextLink href={href} passHref>
    <ChakraLink {...props}>{children}</ChakraLink>
  </NextLink>
);

export default ChakraNextLink;
