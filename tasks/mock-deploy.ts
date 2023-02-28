// import hre from 'hardhat';
import { task } from 'hardhat/config';
import * as fs from 'fs';
import { ContractFactory } from 'ethers/lib/ethers';

type Contracts = 'MockERC721' | 'BloodOfMolochPBT';

task('mock-deploy', 'Deploy mock contracts')
  .setAction(async ({}, { ethers }) => {
    if (hre.network.name !== ('localhost' || 'hardhat')) {
      return console.error("Error: mock deploys can only run on localhost")
    }

    const contracts: Record<Contracts, ContractFactory> = {
      MockERC721: await ethers.getContractFactory("MockERC721"),
      BloodOfMolochPBT: await ethers.getContractFactory('BloodOfMolochPBT'),
    };

    const deployments: Record<Contracts, string> = {
      MockERC721: '',
      BloodOfMolochPBT: '',
    };

    const constructorArguments: Record<Contracts, string[]> = {
      MockERC721: [],
      BloodOfMolochPBT: [],
    };

    const toFile = (path: string, deployment: Record<Contracts, string>) => {
      fs.writeFileSync(path, JSON.stringify(deployment), { encoding: 'utf-8' });
    };

    for (const [name, contract] of Object.entries(contracts)) {
      console.log(`Starting deployment of ${name}`);
      const factory = contract;

      const constructorArgs = Object.entries(constructorArguments).find(
        (entry) => entry[0] === name
      )?.[1];
      console.log(`Constructor arguments: ${constructorArgs}`);

      const instance = constructorArgs
        ? await factory.deploy(...constructorArgs)
        : await factory.deploy();

      await instance.deployed();

      console.log(`${name} is deployed to address: ${instance.address}`);

      deployments[name as Contracts] = instance.address;

      toFile(`mock-deployments/${hre.network.name}.json`, deployments);
    }
  });
