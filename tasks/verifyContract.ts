import { task } from "hardhat/config";

import * as addresses from "../deployments/deployments-goerli.json";


type Contracts = 'BloodOfMolochClaimNFT' | 'BloodOfMolochPBT';

task("verifyContract", "verify")
  .setAction(async (_, { ethers }) => {
    const [admin] = await ethers.getSigners();

    const contracts: Record<Contracts, string> = {
      BloodOfMolochClaimNFT: addresses.BloodOfMolochClaimNFT,
      BloodOfMolochPBT: addresses.BloodOfMolochPBT,
    };


    const constructorArguments: Record<Contracts, string[]> = {
      BloodOfMolochClaimNFT: [admin.address],
      BloodOfMolochPBT: [],
    };

    for (const [name, address] of Object.entries(contracts)) {
      console.log(`Starting verification of ${name}`);
      console.log(name, address);

      const constructorArgs = Object.entries(constructorArguments).find((entry) => entry[0] === name)?.[1];
      console.log(`Constructor arguments: ${constructorArgs}`);

      if (hre.network.config.chainId !== 31337) {
        try {
          const code = await ethers.provider.getCode(address);
          if (code === "0x") {
            console.log(`${name} contract deployment has not completed. waiting to verify...`);
          }
          await hre.run("verify:verify", {
            address: address,
            contract: `contracts/${name}.sol:${name}`,
            constructorArguments: constructorArgs,
          });
        } catch ({ message }) {
          if ((message as string).includes("Reason: Already Verified")) {
            console.log("Reason: Already Verified");
          }
          console.error(message);
        }
      }
    }
  });
