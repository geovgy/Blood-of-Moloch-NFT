import { Flex, Text, Image } from "@chakra-ui/react";
import styled from "@emotion/styled";
import ConnectWallet from "@/components/ConnectWallet";
import { MEDIA_FILES } from "../utils/constants";

const StyledFlex = styled(Flex)`
  flex-direction: column;
  align-items: center;
`;
const StyledInnerFlex = styled(Flex)`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;
const StyledHeroText = styled(Text)`
  font-family: "texturina";
  letter-spacing: 1.2px;
  color: white;
  text-align: center;
  margin-bottom: 2rem;
`;
const StyledSloganText = styled(Text)`
  font-family: "texturina";
  color: white;
  text-align: center;
  max-width: 85%;
`;

export const Hero = () => {
  return (
    <StyledFlex
      minH={{ lg: "110vh", base: "90vh" }}
      px={{ lg: "8rem", md: "4rem", base: "2rem" }}
      py={{ lg: "8rem", md: "4rem", base: "2rem" }}
    >
      <StyledInnerFlex>
        <Image
          src={MEDIA_FILES.logos.header}
          alt="RaidBrood Logo"
          width={{ base: "80px", md: "110px" }}
          height={{ base: "80px", md: "110px" }}
          mb={{ base: 6, md: 12 }}
        />
        <StyledHeroText
          fontSize={{ lg: "72px", base: "48px" }}
          lineHeight={{ lg: "96px", sm: "48px" }}
        >
          Beer for Slayers of Moloch
        </StyledHeroText>
        <StyledSloganText fontSize={{ lg: "28px", base: "24px" }}>
          The first Beer connnected to a physically-backed NFT
        </StyledSloganText>
        <br />
        <Flex justify="center" width="100%">
          <Flex justify="center" width="100%" mx={{ base: 0, md: 6 }} my={6}>
            <ConnectWallet />
          </Flex>
        </Flex>
      </StyledInnerFlex>
    </StyledFlex>
  );
};
