import hre from "hardhat"
const { ethers } = hre
import fs from "fs"
import { Contract } from "ethers";
import { MerkleBloodOfMolochPBT } from "../types/contracts/drafts/MerkleMolochPBT.sol/MerkleBloodOfMolochPBT";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const contractName = "MerkleBloodOfMolochPBT";

  const { name: networkName } = hre.network
  const deployments = JSON.parse(fs.readFileSync(`./deployments/deployments-${networkName}.json`, 'utf-8'))
  const address = deployments[contractName]
  const { chainId } = hre.network.config

  try {
    const [signer] = await ethers.getSigners()
    console.log("Signer:", signer.address)
    let bomInterface = require("../artifacts/contracts/drafts/MerkleMolochPBT.sol/MerkleBloodOfMolochPBT.json")
    const bomContract = new Contract(
      address,
      bomInterface.abi,
      signer
    ) as MerkleBloodOfMolochPBT;

    const chipAddresses = await parseHaloScans();
 

    const merkleTree = createMerkle(chipAddresses);

    console.log("Setting Merkle root", merkleTree.root);

    await bomContract.setMerkleRoot(merkleTree.root);

    console.log("merkle Root set")
  } catch (error: any) {
    console.error(error);
  }
}

function createMerkle(addresses: string[]) {
    const addressInput = addresses.map((address:string)=>[address])as unknown as string [][];
    const tree = StandardMerkleTree.of(addressInput, ['address']);

    fs.writeFileSync('./merkleTree/deployedTree.json', JSON.stringify(tree.dump()));
    // merkleTree = tree;
    return tree;
  }

async function parseHaloScans() {
  const chipAddresses = []
  const dir = fs.readdirSync("./kongchips");
  for(let i=1; i <= dir.length; i++) {
    const file = JSON.parse(fs.readFileSync(`./kongchips/scanned-halos-${i}.json`, 'utf-8'))
    
    for (var key in file) {
      if (file.hasOwnProperty(key)) {
        chipAddresses.push(file[key].address)
      }
    }
  }
  return chipAddresses
}