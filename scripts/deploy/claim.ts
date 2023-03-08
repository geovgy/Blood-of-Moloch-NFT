import hre from "hardhat"
const { ethers } = hre
import fs from "fs/promises"

async function main() {
    const minterAddress = "0x9db771F6972c29bf8778c52ae9dee6A917664c16"
    const networkName = hre.network.name

    const deployedContracts = JSON.parse(await fs.readFile(`./deployments/deployments-${networkName}.json`, 'utf-8'))
    const bomAddress = deployedContracts["BloodOfMolochPBT"]

    const BloodOfMolochFactory = await ethers.getContractFactory("BloodOfMolochClaimNFT")
    const bloodOfMoloch = await BloodOfMolochFactory.deploy(minterAddress, bomAddress)
    await bloodOfMoloch.deployed()

    console.log(`Network: ${networkName}`)
    console.log(`BloodOfMolochClaimNFT Contract deployed at: ${bloodOfMoloch.address}`)
    console.log(`Minter address is: ${minterAddress}`)
    console.log(`PBT address is ${bomAddress}`)

    const { chainId } = hre.network.config
    const address = bloodOfMoloch.address
    const contractName = "BloodOfMolochClaimNFT"
    const constructorArgs = [minterAddress, bomAddress]

    if (chainId !== 31337) {
        try {
            const code = await ethers.provider.getCode(address);
            if (code === "0x") {
                console.log(`${contractName} contract deployment has not completed. waiting to verify...`);
            }
            await hre.run("verify:verify", {
                address,
                contract: `contracts/${contractName}.sol:${contractName}`,
                constructorArguments: constructorArgs,
            });
        } catch (error: any) {
            const { message } = error
            if ((message).includes("already verified")) {
                console.log("Reason: Already Verified");
            }
            console.error(message);
        }
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});