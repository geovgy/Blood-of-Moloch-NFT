import { expect } from "chai";
import { ethers } from "hardhat";
import { BloodOfMolochClaimNFT, BloodOfMolochPBT, NewBloodOfMolochPBT, MockERC721 } from "../types";
import { BigNumber, Signer } from "ethers";
import { LazyMinter } from "../lib/lazyMinter";
import { parseEther } from "ethers/lib/utils";
import fs from "fs/promises";

describe("BloodOfMolochPBT", function () {
  const BOM_NAME = "Blood of Moloch";
  const BOM_SYMBOL = "BoM";
  const BOM_TOTAL_SUPPLY = 300;
  const BOM_BASE_URI = "ipfs://<METADATA>/";

  let bomContract: NewBloodOfMolochPBT;
  let claimContract: MockERC721;
  let signers: Signer[];
  let addresses: string[];
  let chipAddresses: string[];

  const deploy = async function () {
    const MockClaimNFT = await ethers.getContractFactory("MockERC721");
    claimContract = await MockClaimNFT.deploy();

    const BloodOfMolochNFT = await ethers.getContractFactory(
      "NewBloodOfMolochPBT"
    );
    bomContract = await BloodOfMolochNFT.deploy(BOM_TOTAL_SUPPLY);

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
    // const tokenIds = signers.map((signer, index) => index).slice(1);
    await bomContract.seedChipToTokenMapping(
      chipAddresses
    );
    if (enableMint) {
      await bomContract.openMint();
    }
  };

  beforeEach("Setup", async function () {
    await deploy();
  });

  describe("Deployment", function () {
    it("Should deploy MockERC721 successfully", async function () {
      expect(claimContract.address);
    });
    it("Should deploy BloodOfMolochPBT successfully", async function () {
      expect(bomContract.address);
    });
    it("Should set constructor params to state variables", async function () {
      expect(await bomContract.name()).to.equal(BOM_NAME);
      expect(await bomContract.symbol()).to.equal(BOM_SYMBOL);
      expect(await bomContract.TOTAL_SUPPLY()).to.equal(
        BigNumber.from(BOM_TOTAL_SUPPLY)
      );
    });
  });

  describe("Owner functions", function () {
    describe("setBaseURI", function () {
      it("Should setBaseURI as owner", async function () {
        const tx = bomContract.setBaseURI(BOM_BASE_URI);
        await expect(tx).to.not.be.reverted;
      });
      it("Should revert setBaseURI if not owner", async function () {
        const tx = bomContract.connect(signers[1]).setBaseURI(BOM_BASE_URI);
        await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("setClaimToken", function () {
      it("Should setClaimToken as owner", async function () {
        const tx = bomContract.setClaimToken(claimContract.address);
        await expect(tx).to.not.be.reverted;
      });
      it("Should revert setClaimToken if not owner", async function () {
        const tx = bomContract
          .connect(signers[1])
          .setClaimToken(claimContract.address);
        await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
      });
      it("Should revert if param is null address", async function () {
        const tx = bomContract.setClaimToken(
          "0x0000000000000000000000000000000000000000"
        );
        await expect(tx).to.be.revertedWith("BloodOfMoloch: null address");
      });
    });

    describe("seedChipToTokenMapping", function () {
      it("Should seedChipToTokenMapping as owner", async function () {
        chipAddresses = await parseHaloScans()
        // const tokenIds = signers.map((signer, index) => index).slice(1);
        const tokenIds = chipAddresses.map((chip, i) => i)

        const tx = bomContract.seedChipToTokenMapping(
          chipAddresses
        );
        await expect(tx).to.not.be.reverted;
      });
      it("Should revert seedChipToTokenMapping if not owner", async function () {
        const tokenIds = signers.map((signer, index) => index).slice(1);
        const chipAddresses = await parseHaloScans()
        const tx = bomContract
          .connect(signers[1])
          .seedChipToTokenMapping(chipAddresses);
        await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("openMint", function () {
      it("Should openMint as owner after setting baseTokenURI, chips, and _claimToken", async function () {
        await setupForMint(false);
        expect(await bomContract.canMint()).to.equal(false);

        const tx = bomContract.openMint();
        await expect(tx).to.not.be.reverted;
      });
      it("Should revert openMint after fulfilling all requirements if not owner", async function () {
        await setupForMint(false);
        const tx = bomContract.connect(signers[1]).openMint();
        await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
      });
      it("Should revert openMint if missing _baseTokenURI", async function () {
        await bomContract.setClaimToken(claimContract.address);
        const chipAddresses = await parseHaloScans()
        // const tokenIds = signers.map((signer, index) => index).slice(1);
        await bomContract.seedChipToTokenMapping(
          chipAddresses
        );
        const tx = bomContract.openMint();
        expect(tx).to.be.revertedWith("BloodOfMoloch: no base URI");
      });
      it("Should revert openMint if missing claimToken", async function () {
        await bomContract.setBaseURI(BOM_BASE_URI);
        const chipAddresses = await parseHaloScans()
        const tokenIds = signers.map((signer, index) => index).slice(1);
        await bomContract.seedChipToTokenMapping(
          chipAddresses
        );
        const tx = bomContract.openMint();
        expect(tx).to.be.revertedWith("BloodOfMoloch: no claim token");
      });
      it("Should revert openMint if seeded is false", async function () {
        await bomContract.setBaseURI(BOM_BASE_URI);
        await bomContract.setClaimToken(claimContract.address);
        const tx = bomContract.openMint();
        expect(tx).to.be.revertedWith("BloodOfMoloch: no chips seeded");
      });
    });
  });

  describe("Mint", function () {
    it("Should mint", async function () {
      const claimTokenId = 1;
      await claimContract.mint(addresses[0]);
      await claimContract.approve(bomContract.address, claimTokenId);
      await setupForMint(true);
      const chip = signers[1];

      const block = await ethers.provider.getBlock("latest");

      const messagePrefix = "\x19Ethereum Signed Message:\n32";
      const message = ethers.utils.solidityKeccak256(
        ["address", "bytes32"],
        [addresses[0], block.hash]
      );
      const messageBytes = ethers.utils.arrayify(message);
      const messageHash = ethers.utils.solidityKeccak256(
        ["string", "bytes32"],
        [messagePrefix, messageBytes]
      );
      const chipSig = await chip.signMessage(messageBytes);

      const verifiedAddress = ethers.utils.verifyMessage(messageBytes, chipSig);
      const recoveredAddress = ethers.utils.recoverAddress(
        messageHash,
        chipSig
      );

      // console.log("chipAddress", await chip.getAddress())
      // console.log("verifiedAddress:", verifiedAddress)
      // console.log("recoveredAddress:", recoveredAddress)

      // bytes32 blockHash = blockhash(blockHashUsedInSig);
      // bytes32 signedHash = keccak256(abi.encodePacked(_msgSender(), blockHash)).toEthSignedMessageHash();
      // address chipAddr = signedHash.recover(signatureFromChip);

      const tx = bomContract.mint(claimTokenId, chipSig, block.number);
      await expect(tx).to.not.be.reverted;
      await expect(tx)
        .to.emit(bomContract, "PBTMint")
        // .withArgs(1, addresses[1]);
      // expect(await bomContract.tokenIdFor(await chip.getAddress())).to.equal(1);
      expect(await bomContract.ownerOf(await bomContract.tokenIdFor(await chip.getAddress()))).to.equal(addresses[0])
    });
    it("Should burn correct claim tokenId", async function () {
      const claimTokenId = 1;
      await claimContract.mint(addresses[0]);
      await claimContract.approve(bomContract.address, claimTokenId);
      expect(await claimContract.balanceOf(addresses[0])).to.equal(
        BigNumber.from(1)
      );
      await setupForMint(true);
      const chip = signers[1];

      const block = await ethers.provider.getBlock("latest");

      const messagePrefix = "\x19Ethereum Signed Message:\n32";
      const message = ethers.utils.solidityKeccak256(
        ["address", "bytes32"],
        [addresses[0], block.hash]
      );
      const messageBytes = ethers.utils.arrayify(message);
      const messageHash = ethers.utils.solidityKeccak256(
        ["string", "bytes32"],
        [messagePrefix, messageBytes]
      );
      const chipSig = await chip.signMessage(messageBytes);

      const tx = bomContract.mint(claimTokenId, chipSig, block.number);
      await expect(tx)
        .to.emit(bomContract, "Burn")
        .withArgs(addresses[0], claimTokenId, claimContract.address);
      expect(await claimContract.balanceOf(addresses[0])).to.equal(
        BigNumber.from(0)
      );
    });
    it("Should revert mint if !canMint", async function () {
      expect(await bomContract.canMint()).to.equal(false);
      const mockSig = await signers[1].signMessage("Mock Signature");
      const tx = bomContract.mint(1, mockSig, 0);
      await expect(tx).to.be.revertedWithCustomError(
        bomContract,
        "MintNotOpen"
      );
    });
    it("Should revert mint if not approved for claim tokenId PRIOR to minting PBT", async function () {
      await claimContract.mint(addresses[0]);

      await setupForMint(true);
      const tokenId = 1;
      const mockSig = await signers[1].signMessage("Mock Signature");
      const { hash: blockHash, number: blockNumber } =
        await ethers.provider.getBlock("latest");
      const tx = bomContract.mint(tokenId, mockSig, blockNumber);
      await expect(tx).to.be.revertedWith("BloodOfMoloch: not approved");
      expect(await claimContract.ownerOf(tokenId)).to.equal(addresses[0]);
    });
    it("Should revert mint if not owner of claim tokenId PRIOR to minting PBT", async function () {
      await claimContract.mint(addresses[1]);

      await setupForMint(true);
      const tokenId = 1;
      const mockSig = await signers[1].signMessage("Mock Signature");
      const { hash: blockHash, number: blockNumber } =
        await ethers.provider.getBlock("latest");
      const tx = bomContract.mint(tokenId, mockSig, blockNumber);
      await expect(tx).to.be.revertedWith(
        "BloodOfMoloch: not owner of claim token"
      );
      expect(await claimContract.ownerOf(tokenId)).to.equal(addresses[1]);
    });
    it("Should revert mint if chipSignature is invalid PRIOR to burning claim tokenId", async function () {
      const claimTokenId = 1;
      await claimContract.mint(addresses[0]);
      await claimContract.approve(bomContract.address, claimTokenId);
      expect(await claimContract.balanceOf(addresses[0])).to.equal(
        BigNumber.from(1)
      );
      await setupForMint(true);
      const chip = signers[1];

      const block = await ethers.provider.getBlock("latest");

      const messagePrefix = "\x19Ethereum Signed Message:\n32";
      const message = ethers.utils.solidityKeccak256(
        ["address", "bytes32"],
        [addresses[2], block.hash]
      ); // used address other than msgSender for invalid signature
      const messageBytes = ethers.utils.arrayify(message);
      const messageHash = ethers.utils.solidityKeccak256(
        ["string", "bytes32"],
        [messagePrefix, messageBytes]
      );
      const chipSig = await chip.signMessage(messageBytes);

      const tx = bomContract.mint(claimTokenId, chipSig, block.number);
      await expect(tx).to.be.revertedWithCustomError(
        bomContract,
        "InvalidChipAddress"
      );
      expect(await claimContract.balanceOf(addresses[0])).to.equal(
        BigNumber.from(1)
      );
    });
  });

  describe("TokenId", function () {
    it("Should get tokenId for chip address", async function () {
      const claimTokenId = 1;
      await claimContract.mint(addresses[0]);
      await claimContract.approve(bomContract.address, claimTokenId);
      await setupForMint(true);
      const chip = signers[1];

      const block = await ethers.provider.getBlock("latest");

      const messagePrefix = "\x19Ethereum Signed Message:\n32";
      const message = ethers.utils.solidityKeccak256(
        ["address", "bytes32"],
        [addresses[0], block.hash]
      );
      const messageBytes = ethers.utils.arrayify(message);
      const messageHash = ethers.utils.solidityKeccak256(
        ["string", "bytes32"],
        [messagePrefix, messageBytes]
      );
      const chipSig = await chip.signMessage(messageBytes);

      await bomContract.mint(claimTokenId, chipSig, block.number);

      const tokenId = await bomContract.tokenIdFor(await chip.getAddress());
      const owner = await bomContract.ownerOf(tokenId);
      expect(tokenId).to.be.lessThan(BOM_TOTAL_SUPPLY);
      expect(owner).to.equal(addresses[0]);
    });
  });

  describe("TokenURI", function () {
    it("Should get tokenURI for tokenId", async function () {
      const claimTokenId = 1;
      await claimContract.mint(addresses[0]);
      await claimContract.approve(bomContract.address, claimTokenId);
      await setupForMint(true);
      const chip = signers[10];

      const block = await ethers.provider.getBlock("latest");

      const messagePrefix = "\x19Ethereum Signed Message:\n32";
      const message = ethers.utils.solidityKeccak256(
        ["address", "bytes32"],
        [addresses[0], block.hash]
      );
      const messageBytes = ethers.utils.arrayify(message);
      const messageHash = ethers.utils.solidityKeccak256(
        ["string", "bytes32"],
        [messagePrefix, messageBytes]
      );
      const chipSig = await chip.signMessage(messageBytes);

      await bomContract.mint(claimTokenId, chipSig, block.number);

      const tokenId = await bomContract.tokenIdFor(await chip.getAddress());
      const uri = await bomContract.tokenURI(tokenId);
      expect(tokenId).to.be.lessThanOrEqual(BOM_TOTAL_SUPPLY);
      expect(uri).to.equal(BOM_BASE_URI + `${tokenId}`);
    });
  });

  describe("Full", function () {
    async function deploy(pbtAddress: string) {
      const [minter, rando] = await ethers.getSigners();
    
      let factory = await ethers.getContractFactory("BloodOfMolochClaimNFT", minter)
      const contract = await factory.deploy(minter.address, pbtAddress) as BloodOfMolochClaimNFT;
    
      return {
        minter,
        rando,
        contract,
      }
    }

    it("Should burn claim token in exchange for PBT token", async function () {
      const claimTokenId = 0;
      const { contract: claimContract, minter, rando } = await deploy(bomContract.address);

      await claimContract.connect(rando).mintClaimToken({ value: parseEther("0.069") })

      await setupForMint(true);
      const chip = signers[1];

      const block = await ethers.provider.getBlock("latest");

      const messagePrefix = "\x19Ethereum Signed Message:\n32";
      const message = ethers.utils.solidityKeccak256(
        ["address", "bytes32"],
        [await rando.getAddress(), block.hash]
      );
      const messageBytes = ethers.utils.arrayify(message);
      const messageHash = ethers.utils.solidityKeccak256(
        ["string", "bytes32"],
        [messagePrefix, messageBytes]
      );
      const chipSig = await chip.signMessage(messageBytes);

      await bomContract.setBaseURI(BOM_BASE_URI);
      await bomContract.setClaimToken(claimContract.address);
      const chipAddresses = await parseHaloScans()

      await bomContract.seedChipToTokenMapping(
        chipAddresses
      );
      await bomContract.openMint();

      await bomContract
        .connect(rando)
        .mint(claimTokenId, chipSig, block.number);
    });
  });
});
