import { LazyMinter } from "../lib/lazyMinter";
import {getDefaultSigners} from "../lib/utils"
import { ethers } from 'hardhat';
import * as addresses from "../deployments/deployments-localhost.json";
import BloodOfMolochClaimNFTABI from "../artifacts/contracts/BloodOfMolochClaimNFT.sol/BloodOfMolochClaimNFT.json";
import { BloodOfMolochClaimNFT } from "../types";
import * as fs from 'fs';

async function main() {
  const signers = await getDefaultSigners();
  const claimNft = new ethers.Contract(addresses.BloodOfMolochClaimNFT, BloodOfMolochClaimNFTABI.abi, signers.admin) as BloodOfMolochClaimNFT;
  const tokenUri = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
  const minPrice = ethers.utils.parseEther(".001");
  const lazyMinter = new LazyMinter(claimNft, signers.admin);
  const vouchersWSig = [];
  for(let i = 0; i<350; i++){
    const {voucher, signature} = await lazyMinter.createVoucher(i, tokenUri, minPrice);
    const voucherWsig = {
      voucher: voucher,
      signature: signature
    }
    vouchersWSig.push(voucherWsig);       
  }


  const toFile = (path: string, vouchers: any[]) => {
    fs.writeFileSync(path, JSON.stringify(vouchers), { encoding: 'utf-8' });
  };

  toFile(`vouchers/vouchers-${hre.network.name}.json`, vouchersWSig);
 
  

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
