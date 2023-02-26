import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BloodOfMolochPBT, MockERC721 } from "../typechain-types";
import { BigNumber, Signer } from "ethers";
import { getPublicKeysFromScan, getSignatureFromScan } from './utils';

describe("BloodOfMolochPBT", function () {
  const BOM_NAME = "Blood of Moloch"
  const BOM_SYMBOL = "BoM"
  const BOM_TOTAL_SUPPLY = 10
  const BOM_BASE_URI = "ipfs://<METADATA>"

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

  const setupForMint = async function (enableMint: boolean) {
    await bomContract.setBaseURI(BOM_BASE_URI)
    await bomContract.setClaimToken(claimContract.address)
    const tokenIds = signers.map((signer,index) => index).slice(1)
    await bomContract.seedChipToTokenMapping(addresses.slice(1), tokenIds, true)
    if (enableMint) {
      await bomContract.openMint()
    }
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
      it("Should setBaseURI as owner", async function () {
        const tx = bomContract.setBaseURI(BOM_BASE_URI)
        await expect(tx).to.not.be.reverted
      })
      it("Should revert setBaseURI if not owner", async function () {
        const tx = bomContract.connect(signers[1]).setBaseURI(BOM_BASE_URI)
        await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
      })
    })

    describe("setClaimToken", function () {
      it("Should setClaimToken as owner", async function () {
        const tx = bomContract.setClaimToken(claimContract.address)
        await expect(tx).to.not.be.reverted
      })
      it("Should revert setClaimToken if not owner", async function () {
        const tx = bomContract.connect(signers[1]).setClaimToken(claimContract.address)
        await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
      })
      it("Should revert if param is null address", async function () {
        const tx = bomContract.setClaimToken("0x0000000000000000000000000000000000000000")
        await expect(tx).to.be.revertedWith("BloodOfMoloch: null address");
      })
    })

    describe("seedChipToTokenMapping", function () {
      it("Should seedChipToTokenMapping as owner", async function () {
        const tokenIds = signers.map((signer,index) => index).slice(1)
        const tx = bomContract.seedChipToTokenMapping(addresses.slice(1), tokenIds, true)
        await expect(tx).to.not.be.reverted
      })
      it("Should revert seedChipToTokenMapping if not owner", async function () {
        const tokenIds = signers.map((signer,index) => index).slice(1)
        const tx = bomContract.connect(signers[1]).seedChipToTokenMapping(addresses.slice(1), tokenIds, true)
        await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
      })
    })

    describe("openMint", function () {
      it("Should openMint as owner after setting baseTokenURI, chips, and _claimToken", async function () {
        await setupForMint(false)
        expect(await bomContract.canMint()).to.equal(false)

        const tx = bomContract.openMint()
        await expect(tx).to.not.be.reverted
      })
      it("Should revert openMint after fulfilling all requirements if not owner", async function () {
        await setupForMint(false)
        const tx = bomContract.connect(signers[1]).openMint()
        await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
      })
      it("Should revert openMint if missing _baseTokenURI", async function () {
        await bomContract.setClaimToken(claimContract.address)
        const tokenIds = signers.map((signer,index) => index).slice(1)
        await bomContract.seedChipToTokenMapping(addresses.slice(1), tokenIds, true)
        const tx = bomContract.openMint()
        expect(tx).to.be.revertedWith("BloodOfMoloch: no base URI")
      })
      it("Should revert openMint if missing claimToken", async function () {
        await bomContract.setBaseURI(BOM_BASE_URI)
        const tokenIds = signers.map((signer,index) => index).slice(1)
        await bomContract.seedChipToTokenMapping(addresses.slice(1), tokenIds, true)
        const tx = bomContract.openMint()
        expect(tx).to.be.revertedWith("BloodOfMoloch: no claim token")
      })
      it("Should revert openMint if seeded is false", async function () {
        await bomContract.setBaseURI(BOM_BASE_URI)
        await bomContract.setClaimToken(claimContract.address)
        const tx = bomContract.openMint()
        expect(tx).to.be.revertedWith("BloodOfMoloch: no chips seeded")
      })
    })
  })

  // describe("TokenId", function () {
  //   it("Should get tokenId for chip address", async function () {
  //     await setupForMint(true)
  //     const chipSigner = signers[1]
  //     const tokenId = await bomContract.tokenIdFor(await chipSigner.getAddress())
  //     expect(tokenId).to.equal(1)
  //   })
  // })

  describe("Mint", function () {
    xit("Should mint", async function () {
      const claimTokenId = 1
      await claimContract.mint(addresses[0])
      await claimContract.approve(bomContract.address, claimTokenId)
      await setupForMint(true)
      const chip = signers[1]
      // const hash = ethers.utils.keccak256(addresses[1])
      // const sig = await chip.signMessage(ethers.utils.arrayify(hash))
      // const publicKey = ethers.utils.recoverPublicKey(hash, sig)
      // console.log("🚀 ~ file: BloodOfMolochPBT.ts:94 ~ publicKey:", publicKey)
      // const compk = ethers.utils.computePublicKey(publicKey, true)
      // console.log("🚀 ~ file: BloodOfMolochPBT.ts:96 ~ compk:", compk)
      const block = await ethers.provider.getBlock("latest")
      // const chipSignature = await getSignatureFromScan({
      //   chipAddress: await chip.getAddress(),
      //   address: addresses[0],
      //   hash: block.hash,
      //   signer: chip
      // })

      const messagePrefix = "\x19Ethereum Signed Message:\n32";
      const message = ethers.utils.solidityKeccak256(["address", "bytes32"], [addresses[0], block.hash])
      const messageHash = ethers.utils.solidityKeccak256(["string", "bytes32"], [messagePrefix, ethers.utils.arrayify(message)]);
      const chipSig = await chip.signMessage(message)
      const verified = ethers.utils.recoverAddress(messageHash, chipSig)
      console.log("Test file chipAddress", await chip.getAddress())
      console.log("🚀 ~ file: BloodOfMolochPBT.ts:108 ~ verified:", verified)

      // bytes32 blockHash = blockhash(blockNumberUsedInSig);
      // bytes32 signedHash = keccak256(abi.encodePacked(_msgSender(), blockHash)).toEthSignedMessageHash();
      // address chipAddr = signedHash.recover(signatureFromChip);

      await bomContract.mint(claimTokenId, chipSig, block.number)
    })
    it("Should burn correct claim tokenId")
    it("Should revert mint if !canMint", async function () {
      expect(await bomContract.canMint()).to.equal(false)
      const mockSig = await signers[1].signMessage("Mock Signature")
      const tx = bomContract.mint(1, mockSig, 0)
      await expect(tx).to.be.revertedWithCustomError(bomContract, "MintNotOpen")
    })
    it("Should revert mint if not approved for claim tokenId PRIOR to minting PBT", async function () {
      await claimContract.mint(addresses[0])

      await setupForMint(true)
      const tokenId = 1
      const mockSig = await signers[1].signMessage("Mock Signature")
      const { hash: blockHash, number: blockNumber } = await ethers.provider.getBlock("latest")
      const tx = bomContract.mint(tokenId, mockSig, blockNumber)
      await expect(tx).to.be.revertedWith("BloodOfMoloch: not approved")
      expect(await claimContract.ownerOf(tokenId)).to.equal(addresses[0])
    })
    it("Should revert mint if not owner of claim tokenId PRIOR to minting PBT", async function () {
      await claimContract.mint(addresses[1])

      await setupForMint(true)
      const tokenId = 1
      const mockSig = await signers[1].signMessage("Mock Signature")
      const { hash: blockHash, number: blockNumber } = await ethers.provider.getBlock("latest")
      const tx = bomContract.mint(tokenId, mockSig, blockNumber)
      await expect(tx).to.be.revertedWith("BloodOfMoloch: not owner of claim token")
      expect(await claimContract.ownerOf(tokenId)).to.equal(addresses[1])
    })
    it("Should revert mint if chipSignature is invalid PRIOR to burning claim tokenId")
  })
});
