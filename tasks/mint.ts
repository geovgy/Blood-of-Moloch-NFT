import { task } from 'hardhat/config';
import * as fs from 'fs';
import { Contract, ContractFactory } from 'ethers/lib/ethers';
import { BloodOfMolochClaimNFT, BloodOfMolochPBT } from '../types';

type Contracts = 'BloodOfMolochClaimNFT';

task('mint', 'mint claim NFTs by quantity')
  .addOptionalParam('to', 'recipient of tokens to be minted')
  .addOptionalParam('quantity', 'The number of tokens to be minted')
  .setAction(async ({to, quantity}, { ethers }) => {
    const [admin] = await ethers.getSigners();

    const deployments = JSON.parse(fs.readFileSync(`./deployments/deployments-${hre.network.name}.json`, 'utf-8'))
    const address = deployments["BloodOfMolochClaimNFT"]

    let claimInterface = require("../artifacts/contracts/BloodOfMolochClaimNFT.sol/BloodOfMolochClaimNFT.json")
    const claimContract: BloodOfMolochClaimNFT = new Contract(
      address,
      claimInterface.abi,
      admin
    )

    if (quantity <= 0) return console.error("quantity cannot be zero or negative");
    try {
      if (quantity === 1) {
        await claimContract.mint(to)
      } else {
        let recipients: string[] = []
        for(let i=0; i < quantity; i++) {
          recipients.push(to)
        }
        await claimContract.batchMint(recipients)
      }
      console.log(`Successfully minted ${quantity} claim NFTs on ${hre.network.name} to ${to}`)
      // console.log(`Owner of tokens is ${admin.address}`)
    } catch (error: any) {
      const { message } = error
      console.error(message)
    }
  });
