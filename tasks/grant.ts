import { task } from 'hardhat/config';
import * as fs from 'fs';
import { Contract, ContractFactory } from 'ethers/lib/ethers';
import { BloodOfMolochClaimNFT, BloodOfMolochPBT } from '../types';

type Contracts = 'BloodOfMolochClaimNFT';

task('grant', 'grant minter role to address')
  .addOptionalParam('address', 'recipient of granted minter role')
  .setAction(async ({address}, { ethers }) => {
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
      if (!address) throw Error("no address to assign the role")
      const minterRole = await claimContract.MINTER_ROLE()
      console.log("minterRole:", minterRole)
      await claimContract.grantRole(minterRole, address)
      console.log(`Successfully granted MINTER role to ${address} on ${hre.network.name}`)
    } catch (error: any) {
      const { message } = error
      console.error(message)
    }
  });
