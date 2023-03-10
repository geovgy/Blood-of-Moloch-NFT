import { task } from 'hardhat/config';
import * as fs from 'fs';
import { Contract, ContractFactory } from 'ethers/lib/ethers';
import { BloodOfMolochClaimNFT, BloodOfMolochPBT } from '../types';

type Contracts = 'BloodOfMolochClaimNFT' | 'BloodOfMolochPBT';

task('deploy', 'Deploy contracts and verify')
  .addOptionalParam('minter', 'The address of the EOA assigned the minter role')
  .setAction(async ({minter}, { ethers }) => {
    const [admin] = await ethers.getSigners();

    const contracts: Record<Contracts, ContractFactory> = {
      BloodOfMolochPBT: await ethers.getContractFactory('BloodOfMolochPBT'),
      BloodOfMolochClaimNFT: await ethers.getContractFactory(
        'BloodOfMolochClaimNFT'
      ),
    };

    const deployments: Record<Contracts, string> = {
      BloodOfMolochPBT: '',
      BloodOfMolochClaimNFT: '',
    };

    const constructorArguments: Record<Contracts, string[]> = {
      BloodOfMolochPBT: [],
      BloodOfMolochClaimNFT: [minter? minter : admin.address ],
    };

    const toFile = (path: string, deployment: Record<Contracts, string>) => {
      fs.writeFileSync(path, JSON.stringify(deployment), { encoding: 'utf-8' });
    };

    let bomContract: BloodOfMolochPBT;
    for (const [name, contract] of Object.entries(contracts)) {
      console.log(`Starting deployment of ${name}`);
      const factory = contract;

      let constructorArgs = Object.entries(constructorArguments).find(
        (entry) => entry[0] === name
      )?.[1];
      if (name === "BloodOfMolochClaimNFT") {
        constructorArgs = [...constructorArgs, bomContract.address]
      }
      console.log(`Constructor arguments: ${constructorArgs}`);

      const instance = constructorArgs
        ? await factory.deploy(...constructorArgs)
        : await factory.deploy();

      await instance.deployed();

      console.log(`${name} is deployed to address: ${instance.address}`);

      deployments[name as Contracts] = instance.address;

      if (name === "BloodOfMolochPBT") {
        bomContract = instance
      }

      toFile(`deployments/deployments-${hre.network.name}.json`, deployments);


      if (hre.network.name !== ('localhost' || 'hardhat')) {
        try {
          const code = await instance.instance?.provider.getCode(
            instance.address
          );
          if (code === '0x') {
            console.log(
              `${instance.name} contract deployment has not completed. waiting to verify...`
            );
            await instance.instance?.deployed();
          }

          await hre.run('verify:verify', {
            address: instance.address,
            constructorArguments: constructorArgs,
          });
        } catch ({ message }) {
          if ((message as string).includes('Reason: Already Verified')) {
            console.log('Reason: Already Verified');
          }
          console.error(message);
        }
      }
    }
  });
