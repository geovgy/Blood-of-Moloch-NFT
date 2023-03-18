import { VStack, Text, Container, Center, Box } from "@chakra-ui/react";
import { PopupButton } from "@typeform/embed-react";
import styled from "@emotion/styled";

const StyledPopupButton = styled(PopupButton)`
  font-family: texturina;
  color: white;
  background-color: #ff3864;
  font-size: 24px;
  font-weight: 500;
  border-radius: 5px;
  padding: 12px 36px;
  margin-top: 2rem;
  :hover {
    opacity: 0.85;
  }
`;

const ReceiveBeer = () => {
  return (
    <Box py={20} backgroundColor="#2b2c34">
      <Container>
        <VStack mb={20}>
          <Text fontFamily="texturina" textAlign="center" fontSize="4xl">
            Receive your Beer
          </Text>
          <Text fontFamily="texturina" textAlign="center" fontSize="sm">
            (currently only shipping within the United States)
          </Text>
        </VStack>
        <Text fontFamily="texturina" fontSize="lg" textAlign="center">
          Fill the form below to receive your Barrel Aged Blood
        </Text>
        <Text fontFamily="texturina" fontSize="lg" textAlign="center">
          Note: CLAIM NFT&apos;s entered into the form below are marked as
          redeemed. To mint the DRINK NFT and receive shares, user must hold
          CLAIM NFT in wallet and a Barrel Aged Blood of Moloch Kong Chip in
          hand
        </Text>
        <Center>
          <StyledPopupButton id="sOwDR7pF" className="my-button">
            Beer Me Form
          </StyledPopupButton>
        </Center>
      </Container>
    </Box>
  );
};

export default ReceiveBeer;
