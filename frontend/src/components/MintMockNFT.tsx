import { useSigner, useContract } from 'wagmi';
import { Button } from '@chakra-ui/react';
import MockERC721 from "../artifacts/contracts/mock/MockERC721.sol/MockERC721.json";

const MintMockNFT = () => {
  const { data: signer } = useSigner();
  const mockNFT = useContract({
    address: process.env.NEXT_PUBLIC_CLAIM_ADDRESS || "",
    abi: MockERC721.abi,
    signerOrProvider: signer,
  });
  console.log(`mockNFT: ${mockNFT}`, process.env.NEXT_PUBLIC_CLAIM_ADDRESS,  MockERC721.abi)
  const mintMockNFT = async () => {
    const tx = await mockNFT.mint(signer?.getAddress());
    const result = await tx.wait();
    console.log(
      `mint result: ${JSON.stringify(result)}`
    )
  }
  return (
    <div>
      <Button onClick={mintMockNFT}>Mint Mock NFT</Button>
    </div>
  )
}

export default MintMockNFT;