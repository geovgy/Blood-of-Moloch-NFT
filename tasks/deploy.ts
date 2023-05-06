import { task } from 'hardhat/config';
import * as fs from 'fs';
import { BigNumber, Contract, ContractFactory } from 'ethers/lib/ethers';
import { BloodOfMolochClaimNFT, BloodOfMolochPBT, BloodOfMolochMerklePBT } from '../types';

type Contracts = 'BloodOfMolochClaimNFT' | 'BloodOfMolochPBT' | 'BloodOfMolochMerklePBT';

task('deploy', 'Deploy contracts and verify')
  .addOptionalParam('pbtcontract', 'the name of the contract to be deployed')
  .addOptionalParam('maxSupply', 'the max supply of tokens being created')
  .addOptionalParam('minter', 'The address of the EOA assigned the minter role')
  .setAction(async ({minter, pbtcontract, maxSupply }, { ethers }) => {
    const [admin] = await ethers.getSigners();
    let contracts: Record<typeof pbtcontract | BloodOfMolochClaimNFT, ContractFactory>;
    let deployments: Record<typeof pbtcontract | BloodOfMolochClaimNFT, string>;
    let constructorArguments: Record<typeof pbtcontract | BloodOfMolochClaimNFT, (string| BigNumber)[]>
    let supply: BigNumber = maxSupply? BigNumber.from(maxSupply) : BigNumber.from(350);

    if(pbtcontract == 'BloodOfMolochMerklePBT'){
    contracts = {
      BloodOfMolochMerklePBT: await ethers.getContractFactory(pbtcontract),
      BloodOfMolochClaimNFT: await ethers.getContractFactory(
        'BloodOfMolochClaimNFT')
    };
    
    deployments = {
      BloodOfMolochMerklePBT: '',
      BloodOfMolochClaimNFT: '',
    };

    constructorArguments = {
      BloodOfMolochMerklePBT: [supply],
      BloodOfMolochClaimNFT: [minter !== undefined ? minter : admin.address ],
    };

  } else {
    contracts = {
      BloodOfMolochPBT: await ethers.getContractFactory('BloodOfMolochPBT'),
      BloodOfMolochClaimNFT: await ethers.getContractFactory(
        'BloodOfMolochClaimNFT'
      ),
    };

    deployments = {
      BloodOfMolochPBT: '',
      BloodOfMolochClaimNFT: '',
    };

    constructorArguments = {
      BloodOfMolochPBT: [],
      BloodOfMolochClaimNFT: [minter !== undefined ? minter : admin.address ],
    };
  }




    const toFile = (path: string, deployment: Record<Contracts, string>) => {
      fs.writeFileSync(path, JSON.stringify(deployment), { encoding: 'utf-8' });
    };

    let bomContract: BloodOfMolochPBT | BloodOfMolochMerklePBT;

    for (const [name, contract] of Object.entries(contracts)) {
      console.log(`Starting deployment of ${name}`);
      const factory = contract;

      let constructorArgs = Object.entries(constructorArguments).find(
        (entry) => entry[0] === name
      )?.[1];
      
      if (name === "BloodOfMolochClaimNFT" && bomContract && constructorArgs) {
        constructorArgs = [...constructorArgs, bomContract.address]
      }
      console.log(`Constructor arguments: ${constructorArgs}`);

      const instance = constructorArgs
        ? await factory.deploy(...constructorArgs)
        : await factory.deploy();

      await instance.deployed();

      console.log(`${name} is deployed to address: ${instance.address}`);

      deployments[name as Contracts] = instance.address;

      if (name === "BloodOfMolochPBT" || 'BloodOfMolochMerklePBT') {
        bomContract = instance as BloodOfMolochPBT
      }

      toFile(`deployments/deployments-${pbtcontract == 'BloodOfMolochMerklePBT'? 'merklebom' : 'bom'}-${hre.network.name}.json`, deployments);


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
