import { BloodOfMolochPBT } from './../types/contracts/BloodOfMolochPBT';
import hre from "hardhat"
const { ethers } = hre
import fs from "fs/promises"
import { Contract } from "ethers";
import { BloodOfMolochPBT } from "../types/contracts/BloodOfMolochPBT";

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const contractName = "BloodOfMolochPBT";

  const { name: networkName } = hre.network
  const deployments = JSON.parse(await fs.readFile(`./deployments/deployments-${networkName}.json`, 'utf-8'))
  const address = deployments[contractName]
  const { chainId } = hre.network.config

  try {
    const [signer] = await ethers.getSigners()
    console.log("Signer:", signer.address)
    let bomInterface = require("../artifacts/contracts/BloodOfMolochPBT.sol/BloodOfMolochPBT.json")
    // const bomContract: BloodOfMolochPBT = new Contract(
    //   address,
    //   bomInterface.abi,
    //   signer
    // )

    const chipAddresses = await parseHaloScans()
    const tokenIds = chipAddresses.map((addr, i) => i)
    console.log("tokenIds:", tokenIds.length)

    // await bomContract.seedChipToTokenMapping(chipAddresses, tokenIds, true)
    // console.log("Chips seeded")
  } catch (error: any) {
    console.error(error);
  }
}

async function parseHaloScans() {
  const chipAddresses = []
  const dir = await fs.readdir("./kongchips");
  for(let i=1; i <= dir.length; i++) {
    const file = JSON.parse(await fs.readFile(`./kongchips/scanned-halos-${i}.json`, 'utf-8'))
    
    for (var key in file) {
      if (file.hasOwnProperty(key)) {
        chipAddresses.push(file[key].address)
      }
    }
  }
  return chipAddresses
}