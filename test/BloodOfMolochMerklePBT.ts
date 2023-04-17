import { expect } from 'chai';
import { ethers } from 'hardhat';
import {

  MerkleBloodOfMolochPBT,
  MockERC721,
} from '../types';
import { BigNumber, Signer } from 'ethers';
import { BytesLike, parseEther } from 'ethers/lib/utils';
import fs from 'fs';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { Address } from 'cluster';

describe('BloodOfMolochMerklePBT', function () {
  const BOM_NAME = 'Blood of Moloch';
  const BOM_SYMBOL = 'BoM';
  const BOM_TOTAL_SUPPLY = 350;
  const BOM_BASE_URI = 'ipfs://<METADATA>/';

  let bomContract: MerkleBloodOfMolochPBT;
  let claimContract: MockERC721;
  let signers: Signer[];
  let addresses: string[];
  let chipAddresses: string[];
  let merkleRoot: BytesLike;
  let merkleTree: StandardMerkleTree<string[]>;

  const deploy = async function () {
    const MockClaimNFT = await ethers.getContractFactory('MockERC721');
    claimContract = await MockClaimNFT.deploy();

    const BloodOfMolochNFT = await ethers.getContractFactory('MerkleBloodOfMolochPBT');
    bomContract = (await BloodOfMolochNFT.deploy(350)) as MerkleBloodOfMolochPBT;

    signers = await ethers.getSigners();
    addresses = await Promise.all(
      signers.map(async (signer) => await signer.getAddress())
    );
  };

  async function parseHaloScans() {
    const chipAddresses = [];
    addresses.slice(1).forEach((addr) => chipAddresses.push(addr));
    const dir = fs.readdirSync('./kongchips');
    for (let i = 1; i <= dir.length; i++) {
      const file = JSON.parse(
        fs.readFileSync(`./kongchips/scanned-halos-${i}.json`, 'utf-8')
      );

      for (var key in file) {
        if (file.hasOwnProperty(key)) {
          chipAddresses.push(file[key].address);
        }
      }
    }
    return chipAddresses;
  }


  function createMerkle(addresses: string[][]) {

    const tree = StandardMerkleTree.of(addresses, ['address']);

    fs.writeFileSync('./merkleTree/testTree.json', JSON.stringify(tree.dump()));
    merkleTree = tree;
    return tree;
  }

  const setupForMint = async function (enableMint: boolean) {
    await bomContract.setBaseURI(BOM_BASE_URI);
    await bomContract.setClaimToken(claimContract.address);
    chipAddresses = await parseHaloScans();

    let merkleInput: string[][]= []
    //merkle library requires an array of arrays as input
    chipAddresses.map((address:string)=>{merkleInput.push([address])})as unknown as string[];
    //create merkle tree out of array of addresses in arrays
    const merkleTree = createMerkle(merkleInput);

    merkleRoot =  merkleTree.root;
    const tokenIds = chipAddresses.map((signer, index) => index);
    await bomContract.setMerkleRoot(merkleRoot);
    if (enableMint) {
      await bomContract.openMint();
    }
  };

  beforeEach('Setup', async function () {
    await deploy();
  });

  describe("should correctly deploy and setup contract", function () {
    it("Should deploy MockERC721 successfully", async function () {
        expect(claimContract.address);
      });
      it("Should deploy BloodOfMolochPBT successfully", async function () {
        expect(bomContract.address);
      });
      it("Should set constructor params to state variables", async function () {
        expect(await bomContract.name()).to.equal(BOM_NAME);
        expect(await bomContract.symbol()).to.equal(BOM_SYMBOL);
        expect(await bomContract.maxSupply()).to.equal(
          BigNumber.from(BOM_TOTAL_SUPPLY)
        );
      });

    it("Should set the Merkle Root", async function () {
        await setupForMint(true);
        expect(await bomContract.merkleRoot()).to.equal(merkleRoot);
    });
    it("Should mint with appropriate proof", async function () {
        const claimTokenId = 1;
        await claimContract.mint(addresses[0]);
        await claimContract.approve(bomContract.address, claimTokenId);
        await setupForMint(true);
        const chip = await ethers.getImpersonatedSigner(chipAddresses[0]);
  
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
  
        // const verifiedAddress = ethers.utils.verifyMessage(messageBytes, chipSig);
        // const recoveredAddress = ethers.utils.recoverAddress(
        //   messageHash,
        //   chipSig
        // );
        
        //get index of chip address in tree
        const index = merkleTree.leafLookup([chip.address])
        // get merkle proof
        const proof = merkleTree.getProof(index);

  
        const tx = await bomContract.mint(claimTokenId, chipSig, block.number, proof);
        const promise = await tx.wait();

        const event = promise.events?.filter((event)=> event.event?.includes('PBTMint'));
        const tokenId = event![0].args?.tokenId;

        await expect(tx).to.not.be.reverted;
        await expect(tx)
          .to.emit(bomContract, "PBTMint")
          .withArgs(tokenId, chip.address);
        expect(await bomContract.tokenIdFor(await chip.getAddress())).to.equal(tokenId);
      });
    });
});
