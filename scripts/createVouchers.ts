import { LazyMinter } from "../lib/lazyMinter";
import {getDefaultSigners} from "../lib/utils"
import { ethers } from 'hardhat';
import * as addresses from "../deployments/deployments-goerli.json"
import BloodOfMolochClaimNFTABI from "../artifacts/contracts/BloodOfMolochClaimNFT.sol/BloodOfMolochClaimNFT.json";
import { BloodOfMolochClaimNFT } from "../types";
async function main() {
  const signers = await getDefaultSigners();
  const claimNft = new ethers.Contract(addresses.BloodOfMolochClaimNFT, BloodOfMolochClaimNFTABI.abi, signers.admin) as BloodOfMolochClaimNFT;
  const tokenUri = "";
  const minPrice = ethers.utils.parseEther(".001");
  const lazyMinter = new LazyMinter(claimNft, signers.admin);
  for(let i = 0; i<350; i++){
    lazyMinter.createVoucher(i, tokenUri, minPrice)
    
  }
 
  

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
