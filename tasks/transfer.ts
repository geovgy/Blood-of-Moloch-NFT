import { task } from 'hardhat/config';
import * as fs from 'fs';
import { Contract, ContractFactory } from 'ethers/lib/ethers';
import { BloodOfMolochClaimNFT, BloodOfMolochPBT } from '../types';

type Contracts = 'BloodOfMolochClaimNFT';

task('transfer', 'transfer claim NFT to recipient')
  .addOptionalParam('to', 'recipient of NFT transfer')
  .addOptionalParam('id', 'tokenId to be transferred')
  .setAction(async ({to, id}, { ethers }) => {
    const [admin] = await ethers.getSigners();

    const deployments = JSON.parse(fs.readFileSync(`./deployments/deployments-${hre.network.name}.json`, 'utf-8'))
    const claimAddress = deployments["BloodOfMolochClaimNFT"]

    let claimInterface = require("../artifacts/contracts/BloodOfMolochClaimNFT.sol/BloodOfMolochClaimNFT.json")
    const claimContract: BloodOfMolochClaimNFT = new Contract(
      claimAddress,
      claimInterface.abi,
      admin
    )

    // grantRole(bytes32 role, address account)
    // bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    try {
      if (!to) throw Error("no address assigned")
      await claimContract['safeTransferFrom(address,address,uint256)'](admin.address, to, id)
      console.log(`Successfully transferred BloodOfMolochClaimNFT #${id} to ${to} on ${hre.network.name}`)
    } catch (error: any) {
      const { message } = error
      console.error(message)
    }
  });
