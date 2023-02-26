import hre from "hardhat"
const { ethers } = hre

async function main() {
    const BloodOfMolochFactory = await ethers.getContractFactory("BloodOfMolochPBT")
    const bloodOfMoloch = await BloodOfMolochFactory.deploy()
    await bloodOfMoloch.deployed()

    console.log(`Network: ${hre.network.name}`)
    console.log(`BloodOfMolochPBT Contract deployed at: ${bloodOfMoloch.address}`)
    console.log(`Owner address is: ${await bloodOfMoloch.owner()}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });