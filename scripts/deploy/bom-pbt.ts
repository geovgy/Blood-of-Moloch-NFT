import hre from "hardhat"
const { ethers } = hre
import fs from "fs/promises"

async function main() {
    const networkName = hre.network.name
    const BloodOfMolochFactory = await ethers.getContractFactory("BloodOfMolochPBT")
    const bloodOfMoloch = await BloodOfMolochFactory.deploy()
    await bloodOfMoloch.deployed()

    console.log(`Network: ${networkName}`)
    console.log(`BloodOfMolochPBT Contract deployed at: ${bloodOfMoloch.address}`)
    console.log(`Owner address is: ${await bloodOfMoloch.owner()}`)

    const newDeployment = {
        contract: "BloodOfMolochPBT",
        chainId: hre.network.config.chainId,
        address: bloodOfMoloch.address,
        owner: await bloodOfMoloch.owner(),
        timestamp: new Date()
    }

    let deployments: any 
    try {
        deployments = JSON.parse(await fs.readFile('./scripts/deployments.json', 'utf-8'))
    } catch (error) {
        deployments = {}
        deployments[`${networkName}`] = []
    }
    
    const updated: Object[] = deployments[networkName] || []
    updated.push(newDeployment)
    deployments[networkName] = updated

    await fs.writeFile(`./scripts/deployments.json`, JSON.stringify(deployments))
        .then(() => console.log('Wrote deployment to JSON file'))
        .catch((err: any) => console.log(`~~~ Error ~~~\n${err}`))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});