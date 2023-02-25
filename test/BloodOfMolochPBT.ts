import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BloodOfMolochPBT, MockERC721 } from "../typechain-types";
import { BigNumber, Signer } from "ethers";

describe("BloodOfMolochPBT", function () {
  const BOM_NAME = "Blood of Moloch"
  const BOM_SYMBOL = "BoM"
  const BOM_TOTAL_SUPPLY = 10
  let bomContract: BloodOfMolochPBT
  let claimContract: MockERC721
  let signers: Signer[]
  let addresses: string[]

  const deploy = async function () {
    const MockClaimNFT = await ethers.getContractFactory("MockERC721")
    claimContract = await MockClaimNFT.deploy()

    const BloodOfMolochNFT = await ethers.getContractFactory("BloodOfMolochPBT")
    bomContract = await BloodOfMolochNFT.deploy("Blood of Moloch", "BoM", BOM_TOTAL_SUPPLY)

    signers = await ethers.getSigners()
    addresses = await Promise.all(signers.map(async signer => await signer.getAddress()))
  }

  beforeEach("Setup", async function () {
    await deploy()
  })

  describe("Deployment", function () {
    it("Should deploy MockERC721 successfully", async function () {
      expect(claimContract.address)
    })
    it("Should deploy BloodOfMolochPBT successfully", async function () {
      expect(bomContract.address)
    })
    it("Should set constructor params to state variables", async function () {
      expect(await bomContract.name()).to.equal(BOM_NAME)
      expect(await bomContract.symbol()).to.equal(BOM_SYMBOL)
      expect(await bomContract.TOTAL_SUPPLY()).to.equal(BigNumber.from(BOM_TOTAL_SUPPLY))
    })
  })

  describe("Owner functions", function () {
    describe("setBaseURI", function () {
      it("Should setBaseURI as owner")
      it("Should revert setBaseURI if not owner")
    })

    describe("setClaimToken", function () {
      it("Should setClaimToken as owner")
      it("Should revert setClaimToken if not owner")
    })

    describe("seedChipToTokenMapping", function () {
      it("Should seedChipToTokenMapping as owner")
      it("Should revert seedChipToTokenMapping if not owner")
    })

    describe("openMint", function () {
      it("Should openMint as owner after setting baseTokenURI, chips, and _claimToken")
      it("Should revert openMint after fulfilling all requirements if not owner")
      it("Should revert openMint if missing _baseTokenURI")
      it("Should revert openMint if missing claimToken")
      it("Should revert openMint if seeded is false")
    })
  })
});
