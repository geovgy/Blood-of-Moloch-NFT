import { expect } from "chai";
import { ethers } from "hardhat";
import { BloodOfMolochClaimNFT, BloodOfMolochPBT, MerkleBloodOfMolochPBT, MockERC721 } from "../types";
import { BigNumber, Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";
import fs from "fs/promises";

describe("BloodOfMolochPBT", function () {
    const BOM_NAME = "Blood of Moloch";
    const BOM_SYMBOL = "BoM";
    const BOM_TOTAL_SUPPLY = 350;
    const BOM_BASE_URI = "ipfs://<METADATA>/";
  
    let bomContract: MerkleBloodOfMolochPBT;
    let claimContract: MockERC721;
    let signers: Signer[];
    let addresses: string[];
    let chipAddresses: string[];
  
    const deploy = async function () {
      const MockClaimNFT = await ethers.getContractFactory("MockERC721");
      claimContract = await MockClaimNFT.deploy();
  
      const BloodOfMolochNFT = await ethers.getContractFactory(
        "MerkleMolochPBT"
      );
      bomContract = await BloodOfMolochNFT.deploy() as MerkleBloodOfMolochPBT;
  
      signers = await ethers.getSigners();
      addresses = await Promise.all(
        signers.map(async (signer) => await signer.getAddress())
      );
    };
  
    async function parseHaloScans() {
      const chipAddresses = []
      addresses.slice(1).forEach(addr => chipAddresses.push(addr))
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
  
    const setupForMint = async function (enableMint: boolean) {
      await bomContract.setBaseURI(BOM_BASE_URI);
      await bomContract.setClaimToken(claimContract.address);
      const chipAddresses = await parseHaloScans()
      const tokenIds = chipAddresses.map((signer, index) => index);
      await bomContract.seedChipToTokenMapping(
        chipAddresses,
        tokenIds,
        true
      );
      if (enableMint) {
        await bomContract.openMint();
      }
    };
  
    beforeEach("Setup", async function () {
      await deploy();
    });


});