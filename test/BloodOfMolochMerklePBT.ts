import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { BloodOfMolochMerklePBT, MockERC721 } from '../types';
import { BigNumber } from 'ethers';
import { BytesLike } from 'ethers/lib/utils';
import fs from 'fs';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { blob } from 'stream/consumers';
import { Sign } from 'crypto';

describe('BloodOfMolochMerklePBT', function () {
  const BOM_NAME = 'Blood of Moloch';
  const BOM_SYMBOL = 'BoM';
  const BOM_TOTAL_SUPPLY = 350;
  const BOM_BASE_URI = 'ipfs://<METADATA>/';
  let bomContract: BloodOfMolochMerklePBT;
  let claimContract: MockERC721;
  let claimTokenIds: BigNumber[];
  let signers: SignerWithAddress[];
  let signer: SignerWithAddress;
  let addresses: string[];
  let chipAddresses: string[];
  let merkleRoot: BytesLike;
  let merkleTree: StandardMerkleTree<string[]>;

 

  const deploy = async function () {
    const MockClaimNFT = await ethers.getContractFactory('MockERC721');
    claimContract = await MockClaimNFT.deploy();

    const BloodOfMolochNFT = await ethers.getContractFactory(
      'BloodOfMolochMerklePBT'
    );
    bomContract = (await BloodOfMolochNFT.deploy(
      350
    )) as BloodOfMolochMerklePBT;
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

  function createMerkle(addresses: string[]) {
    const addressInput = addresses.map((address: string) => [
      address,
    ]) as unknown as string[][];

    const tree = StandardMerkleTree.of(addressInput, ['address']);

    fs.writeFileSync('./merkleTree/testTree.json', JSON.stringify(tree.dump()));
    merkleTree = tree;
    return tree;
  }

  const setupForMint = async (enableMint: boolean) => {
    await bomContract.setBaseURI(BOM_BASE_URI);
    await bomContract.setClaimToken(claimContract.address);

    //create merkle tree out of array of addresses in arrays
    const merkleTree = createMerkle(chipAddresses);

    merkleRoot = merkleTree.root;

    

    if (enableMint) {
      await bomContract.setMerkleRoot(merkleRoot);
      await bomContract.openMint();
    }
  };

  const mintClaimTokens = async (
    supply: number,
    signerAddress: string
  ): Promise<BigNumber[]> => {
    const tokenIds = [];

    for (let i = 0; i < supply; i++) {
      const tx = await claimContract.mint(signerAddress);
      const promise = await tx.wait();

      const event = promise.events?.filter((e) =>
        e.event?.includes('Transfer')
      );
      const newTokenId: BigNumber = event![0].args?.tokenId;

      tokenIds.push(newTokenId);
    }

    return tokenIds;
  };

  const getChipSignature = async (chipAddress: string) => {
    const chip = await ethers.getImpersonatedSigner(chipAddress);

    const block = await ethers.provider.getBlock('latest');

    const messagePrefix = '\x19Ethereum Signed Message:\n32';
    const message = ethers.utils.solidityKeccak256(
      ['address', 'bytes32'],
      [signer.address, block.hash]
    );
    const messageBytes = ethers.utils.arrayify(message);
    const messageHash = ethers.utils.solidityKeccak256(
      ['string', 'bytes32'],
      [messagePrefix, messageBytes]
    );
    const chipSig = await chip.signMessage(messageBytes);
    return { chip, chipSig, block };
  };

  function getMerkleProof(address: string, tree: any): string[] {
    //get index of chip address in tree
    const index = tree.leafLookup([address]);
    // get merkle proof
    const proof = tree.getProof(index);

    return proof;
  }
  before('parse scans', async function() {
    signers = await ethers.getSigners();
    signer = signers[0];
    addresses = await Promise.all(
      signers.map(async (signer) => await signer.getAddress())
    );
    chipAddresses = await parseHaloScans();
  });

  describe('Deployment and setup', function () {
    beforeEach('Setup', async function () {
      await deploy();
      claimTokenIds = await mintClaimTokens(1, signer.address);
      await setupForMint(false);
    });
    it('Should deploy MockERC721 successfully', async function () {
      expect(claimContract.address);
    });
    it('Should deploy BloodOfMolochPBT successfully', async function () {
      expect(bomContract.address);
    });
    it('Should set constructor params to state variables', async function () {
      expect(await bomContract.name()).to.equal(BOM_NAME);
      expect(await bomContract.symbol()).to.equal(BOM_SYMBOL);
      expect(await bomContract.maxSupply()).to.equal(
        BigNumber.from(BOM_TOTAL_SUPPLY)
      );
    });

    it('Should set the Merkle Root', async function () {
      await bomContract.setMerkleRoot((merkleRoot));
      expect(await bomContract.merkleRoot()).to.equal(merkleRoot);
    });
    it('Should revert if setMerkle root is called by wrong eoa', async function () {
      await expect(bomContract.connect(signers[1]).setMerkleRoot((merkleRoot))).to.be.revertedWith('Ownable: caller is not the owner')
    });
    it('Should open minting', async function () {
      await bomContract.setMerkleRoot((merkleRoot));
      expect(await bomContract.openMint()).to.not.be.reverted;
    });
    it('Should revert openMint if merkle root is not set', async function () {
      await expect(bomContract.openMint()).to.be.revertedWith('Merkle root not set');

    })
  });
  describe('Minting', function () {
    beforeEach('Setup', async function () {
      await deploy();
      claimTokenIds = await mintClaimTokens(1, signer.address);
      await setupForMint(true);
    });
    it('Should mint with appropriate proof', async function () {
      const claimTokenId = claimTokenIds ? claimTokenIds[0].toNumber() : 0;

      const { chip, chipSig, block } = await getChipSignature(chipAddresses[0]);

      const proof = getMerkleProof(chip.address, merkleTree);

      //approve bom to spend claim tokens
      await claimContract.approve(bomContract.address, claimTokenId);

      const tx = await bomContract.mint(
        claimTokenId,
        chipSig,
        block.number,
        proof
      );
      const promise = await tx.wait();

      const event = promise.events?.filter((event) =>
        event.event?.includes('PBTMint')
      );
      const tokenId = event![0].args?.tokenId;

      await expect(tx).to.not.be.reverted;
      await expect(tx)
        .to.emit(bomContract, 'PBTMint')
        .withArgs(tokenId, chip.address);
      expect(await bomContract.tokenIdFor(await chip.getAddress())).to.equal(
        tokenId
      );
    });

    it('should revert with an invalid address', async function () {
      const claimTokenId = claimTokenIds ? claimTokenIds[0].toNumber() : 0;

      const { chipSig, block } = await getChipSignature(chipAddresses[0]);
      // create a different merkle than root hash
      const newMerkle = createMerkle(addresses);

      const newProof = getMerkleProof(addresses[2], newMerkle);

      //approve bom to spend claim tokens
      await claimContract.approve(bomContract.address, claimTokenId);

      await expect(
        bomContract.mint(claimTokenId, chipSig, block.number, newProof)
      ).to.be.revertedWithCustomError(bomContract, 'InvalidChipAddress');
    });

    it('Should burn correct claim tokenId', async function () {
      const claimTokenId = claimTokenIds ? claimTokenIds[0].toNumber() : 0;

      const { chip, chipSig, block } = await getChipSignature(chipAddresses[0]);

      const proof = getMerkleProof(chip.address, merkleTree);

      //approve bom to spend claim tokens
      await claimContract.approve(bomContract.address, claimTokenId);

      const tx = await bomContract
        .connect(signer)
        .mint(claimTokenId, chipSig, block.number, proof);

      await expect(tx)
        .to.emit(bomContract, 'Burn')
        .withArgs(signer.address, claimTokenId, claimContract.address);
      expect(await claimContract.balanceOf(signer.address)).to.equal(
        BigNumber.from(0)
      );
    });

    it('Should revert if blood of moloch contract is not approved to spend claim token', async function () {
      const claimTokenId = claimTokenIds ? claimTokenIds[0].toNumber() : 0;

      const { chip, chipSig, block } = await getChipSignature(chipAddresses[0]);

      const proof = getMerkleProof(chip.address, merkleTree);

      const tx = bomContract
        .connect(signer)
        .mint(claimTokenId, chipSig, block.number, proof);

      await expect(tx).to.be.revertedWith('BloodOfMoloch: not approved');
    });

    it('Should revert if chip has already minted', async function () {
      const newClaimTokenIds = await mintClaimTokens(2, signer.address);

      const [claimTokenId, claimTokenId2] = [...newClaimTokenIds!];

      const { chip, chipSig, block } = await getChipSignature(chipAddresses[0]);

      const proof = getMerkleProof(chip.address, merkleTree);

      //approve bom to spend claim tokens
      await claimContract.approve(bomContract.address, claimTokenId);

      await bomContract
        .connect(signer)
        .mint(claimTokenId, chipSig, block.number, proof);
      await claimContract.approve(bomContract.address, claimTokenId2);
      expect(await bomContract.balanceOf(signer.address)).to.equal(
        BigNumber.from(1)
      );
      await expect(
        bomContract.mint(claimTokenId2, chipSig, block.number, proof)
      ).to.be.revertedWithCustomError(
        bomContract,
        'ChipAlreadyLinkedToMintedToken'
      );
    });
    it('Should revert if claim token id does not exist', async function () {
      const { chip, chipSig, block } = await getChipSignature(chipAddresses[0]);

      const proof = getMerkleProof(chip.address, merkleTree);

      //approve bom to spend claim tokens
      await expect(
        bomContract.connect(signer).mint(2, chipSig, block.number, proof)
      ).to.be.revertedWith('ERC721: invalid token ID');
    });
    it('Should revert if msg.sender is not claim token owner', async function () {
      const { chip, chipSig, block } = await getChipSignature(chipAddresses[0]);

      const proof = getMerkleProof(chip.address, merkleTree);

      //approve bom to spend claim tokens
      await expect(
        bomContract.connect(signers[1]).mint(1, chipSig, block.number, proof)
      ).to.be.revertedWith('BloodOfMoloch: not owner of claim token');
    });
  });
  describe('Transfer', function () {
    let pbtTokenId: BigNumber;
    let user: SignerWithAddress;
    beforeEach('Setup', async function () {
      await deploy();
      user = signers[1];
      claimTokenIds = await mintClaimTokens(2, signer.address);
      await setupForMint(true);
      const claimTokenId = claimTokenIds ? claimTokenIds[0].toNumber() : 0;

      const { chip, chipSig, block } = await getChipSignature(chipAddresses[0]);

      const proof = getMerkleProof(chip.address, merkleTree);

      //approve bom to spend claim tokens
      await claimContract.approve(bomContract.address, claimTokenId);

     const tx =  await bomContract.mint(
        claimTokenId,
        chipSig,
        block.number,
        proof
      );
      const promise = await tx.wait();
      const event = promise.events?.filter((event) =>
      event.event?.includes('PBTMint')
    );
    pbtTokenId = event![0].args?.tokenId;
    });
    it('regular openzeppelin transfers should revert', async function () {
      await expect(bomContract['safeTransferFrom(address,address,uint256)'](signer.address, user.address, 1 )).to.be.revertedWithCustomError(bomContract, 'InvalidFunction');
      await expect(bomContract['safeTransferFrom(address,address,uint256,bytes)'](signer.address, user.address, 1 , merkleRoot)).to.be.revertedWithCustomError(bomContract, 'InvalidFunction');
      await expect(bomContract.transferFrom(signer.address, user.address, 1)).to.be.revertedWithCustomError(bomContract, 'InvalidFunction');
    });
    it('Should transfer with valid chip signature', async function () {
      const { chipSig, block } = await getChipSignature(chipAddresses[0]);
      expect(await bomContract['transferTokenWithChip(bytes,uint256)'](chipSig, block.number)).to.emit(bomContract, 'Transfer');
    });
    it('Should revert with invalid block number', async function () {
      const { chipSig, block } = await getChipSignature(chipAddresses[0]);
     await expect(bomContract['transferTokenWithChip(bytes,uint256)'](chipSig, 1111)).to.be.revertedWithCustomError(bomContract, 'InvalidBlockNumber');
    });
    it('Should revert with an invalid signature', async function () {
      const { chipSig, block } = await getChipSignature(chipAddresses[3]);
      await expect(bomContract['transferTokenWithChip(bytes,uint256)'](chipSig, block.number)).to.be.revertedWithCustomError(bomContract, 'InvalidSignature');
    });
  });
});
