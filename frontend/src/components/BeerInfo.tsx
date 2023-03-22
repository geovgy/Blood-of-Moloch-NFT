import {
  Box,
  Flex,
  Heading,
  Text,
  Link,
  VStack,
  Divider,
  Stack,
  Center,
} from "@chakra-ui/react";

type DescriptionProps = {
  name: string;
  content: string;
};

type TraitsProps = {
  ibu: number;
  abv: number;
};
const Description = ({ name, content }: DescriptionProps) => {
  return (
    <Flex direction="column" minW={"250px"} px={"3em"} gap={2}>
      <Heading textTransform="uppercase">{name}</Heading>
      <Text w={"100%"} textAlign={"left"}>
        The{" "}
        <Link
          href="https://brood.raidguild.org/bloodofmoloch"
          rel="nofollow"
          target="_blank"
          color="#ff3864"
        >
          blood
        </Link>{" "}
        that we harvested back in February 2022 was put into bourbon barrels
        from our friends at Foundry Distilling. Over the last year the liquid
        mellowed and gained complexity, evolving from the hard-biting, brash and
        bold Blood of Moloch Imperial stout to the bottomlessly rich,
        unbelievably chocolatey and vanilla laced potion harnessed and sealed in
        wax. No alterations or flavor were added. Simply quality ingredients,
        skill and time. Indulgence awaits.
      </Text>
    </Flex>
  );
};

const Traits = ({ ibu, abv }: TraitsProps) => {
  const style = {
    heading: {
      fontFamily: `'futura-pt', sans-serif`,
    },
    data: {
      fontSize: `40px`,
      fontWeight: `200`,
      color: `#898989`,
    },
  };

  return (
    <Flex minW={"250px"} justifyContent={"center"} m="0 !important">
      <Flex direction="column" alignItems="center">
        <Heading sx={style.heading}>ABV</Heading>
        <Text sx={style.data}>{`${abv} %`}</Text>
      </Flex>
      <Divider
        orientation="vertical"
        mx={4}
        borderColor="#EBEBEB"
        h="100px"
        borderLeftWidth="2px !important"
      />
      <Flex direction="column" alignItems="center">
        <Heading sx={style.heading}>IBU</Heading>
        <Text sx={style.data}>{ibu}</Text>
      </Flex>
    </Flex>
  );
};

const BeerInfo = ({ bgColor, copy }) => {
  return (
    <Center w={"100% "} background={bgColor}>
      <Stack
        direction={["column", "row"]}
        justifyContent={"center"}
        py={"5em"}
        maxW={"750px"}
        gap={8}
      >
        <Description name={copy.style} content={copy.beer} />
        <Traits ibu={copy.traits.ibu} abv={copy.traits.abv} />
      </Stack>
    </Center>
  );
};

export default BeerInfo;
