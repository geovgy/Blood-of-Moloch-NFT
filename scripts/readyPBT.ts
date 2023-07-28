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

  if (chainId !== 31337) {
    try {
      const [signer] = await ethers.getSigners()
      let bomInterface = require("../artifacts/contracts/BloodOfMolochPBT.sol/BloodOfMolochPBT.json")
      const bomContract: BloodOfMolochPBT = new Contract(
        address,
        bomInterface.abi,
        signer
      ) as BloodOfMolochPBT;

      const claimAddress = deployments["BloodOfMolochClaimNFT"]
      if (!claimAddress) throw Error("No address of claim NFT contract")

      await bomContract.setClaimToken(claimAddress)
      console.log(`Set claim NFT address to ${claimAddress} on ${hre.network.name}`)
    } catch (error: any) {
      console.error(error);
    }
  }
}