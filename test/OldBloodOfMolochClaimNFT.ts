import { expect } from "chai";
import { ethers } from 'hardhat';
import { LazyMinter } from'../lib/lazyMinter';
import { OldBloodOfMolochClaimNFT } from '../types';

describe("Claim NFT", function() {
  async function deploy() {
    const [minter, redeemer, rando] = await ethers.getSigners();
  
    let factory = await ethers.getContractFactory("OldBloodOfMolochClaimNFT", minter)
    const contract = await factory.deploy(minter.address, rando.address) as OldBloodOfMolochClaimNFT;
  
    // the redeemerContract is an instance of the contract that's wired up to the redeemer's signing key
    const redeemerFactory = factory.connect(redeemer)
    const redeemerContract = redeemerFactory.attach(contract.address)
  
    return {
      minter,
      redeemer,
      rando,
      contract,
      redeemerContract,
    }
  }
  let minPrice = ethers.utils.parseEther(".001");
  it("Should deploy", async function() {
    const signers = await ethers.getSigners();
    const minter = signers[0];

    const LazyNFT = await ethers.getContractFactory("BloodOfMolochClaimNFT");
    const lazynft = await LazyNFT.deploy(minter.address, signers[1].address);
    await lazynft.deployed();
  });

  it("Should redeem an NFT from a signed voucher", async function() {
    const { contract, redeemer, minter } = await deploy()

    const lazyMinter = new LazyMinter(contract, minter);
    const {voucher, signature } = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", 0)
    
    await expect(contract.connect(redeemer).redeem(redeemer.address, voucher, signature))
      .to.emit(contract, 'Transfer')  // transfer from null address to minter
      .withArgs('0x0000000000000000000000000000000000000000', minter.address, voucher.tokenId)
      .and.to.emit(contract, 'Transfer') // transfer from minter to redeemer
      .withArgs(minter.address, redeemer.address, voucher.tokenId);
  });

  it("Should fail to redeem an NFT that's already been claimed", async function() {
    const { contract, redeemerContract, redeemer, minter } = await deploy()

    const lazyMinter = new LazyMinter( contract, minter)
    const {voucher, signature} = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", 0)

    await expect(redeemerContract.redeem(redeemer.address, voucher, signature))
      .to.emit(contract, 'Transfer')  // transfer from null address to minter
      .withArgs('0x0000000000000000000000000000000000000000', minter.address, voucher.tokenId)
      .and.to.emit(contract, 'Transfer') // transfer from minter to redeemer
      .withArgs(minter.address, redeemer.address, voucher.tokenId);

    await expect(redeemerContract.redeem(redeemer.address, voucher, signature))
      .to.be.revertedWith('cannot claim an already minted token')
  });

  it("Should fail to redeem an NFT voucher that's signed by an unauthorized account", async function() {
    const { contract, redeemerContract, redeemer, rando } = await deploy()

    
    const lazyMinter = new LazyMinter(contract, rando)
    const {voucher, signature} = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", minPrice)

    await expect(redeemerContract.redeem(redeemer.address, voucher, signature))
      .to.be.revertedWith('Signature invalid or unauthorized')
  });

  it("Should fail to redeem an NFT voucher that's been modified", async function() {
    const { contract, redeemerContract, redeemer, rando } = await deploy()

    const lazyMinter = new LazyMinter(contract, rando)
    const {voucher, signature} = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", minPrice)
    voucher.tokenId = 2
    await expect(redeemerContract.redeem(redeemer.address, voucher, signature))
      .to.be.revertedWith('Signature invalid or unauthorized')
  });

  it("Should fail to redeem an NFT voucher with an invalid signature", async function() {
    const { contract, redeemerContract, redeemer, minter, rando } = await deploy()

    
    const lazyMinter = new LazyMinter(contract, rando)
    const {voucher} = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", minPrice)

    const dummyData = ethers.utils.randomBytes(128)
    const signature = await minter.signMessage(dummyData)
    
    await expect(redeemerContract.redeem(redeemer.address, voucher, signature))
      .to.be.revertedWith('Signature invalid or unauthorized')
  });

  it("Should redeem if payment is >= minPrice", async function() {
    const { contract, redeemerContract, redeemer, minter } = await deploy()

    const lazyMinter = new LazyMinter( contract, minter )
    const minPrice = ethers.constants.WeiPerEther // charge 1 Eth
    const {voucher, signature} = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", minPrice)

    await expect(redeemerContract.redeem(redeemer.address, voucher, signature, { value: minPrice }))
      .to.emit(contract, 'Transfer')  // transfer from null address to minter
      .withArgs('0x0000000000000000000000000000000000000000', minter.address, voucher.tokenId)
      .and.to.emit(contract, 'Transfer') // transfer from minter to redeemer
      .withArgs(minter.address, redeemer.address, voucher.tokenId)
  })

  it("Should fail to redeem if payment is < minPrice", async function() {
    const { contract, redeemerContract, redeemer, minter } = await deploy()

    const lazyMinter = new LazyMinter( contract, minter )
    const minPrice = ethers.constants.WeiPerEther // charge 1 Eth
    const {voucher, signature} = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", minPrice)

    const payment = minPrice.sub(10000)
    await expect(redeemerContract.redeem(redeemer.address, voucher, signature, { value: payment }))
      .to.be.revertedWith('Insufficient funds to redeem')
  });

  it("Should make payments available to minter for withdrawal", async function() {
    const { contract, redeemerContract, redeemer, minter } = await deploy()

    const lazyMinter = new LazyMinter( contract, minter )
    const minPrice = ethers.constants.WeiPerEther // charge 1 Eth
    const {voucher, signature} = await lazyMinter.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", minPrice)
    
    // the payment should be sent from the redeemer's account to the contract address
    await expect(await redeemerContract.redeem(redeemer.address, voucher, signature, { value: minPrice }))
      .to.changeEtherBalances([redeemer, contract], [minPrice.mul(-1), minPrice]) 

    // minter should have funds available to withdraw
    expect(await contract.availableToWithdraw()).to.equal(minPrice)

    // withdrawal should increase minter's balance
    await expect(await contract.withdraw())
      .to.changeEtherBalance(minter, minPrice)

    // minter should now have zero available
    expect(await contract.availableToWithdraw()).to.equal(0)
  });
  it("should create 350 vouchers and redeem them", async function() {
    const { contract, minter, redeemer } = await deploy();

    const lazyMinter = new LazyMinter(contract, minter);
    const minPrice = ethers.utils.parseEther(".001");
    let vouchersWSig = [];
    for(let i =0; i<350; i++){
        const voucherWSig = await lazyMinter.createVoucher(i, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", minPrice);
        vouchersWSig.push(voucherWSig);
    }
    expect(vouchersWSig.length).to.eq(350);

    vouchersWSig.forEach(async (voucher)=> {
      await expect(contract.connect(redeemer).redeem(redeemer.address, voucher.voucher, voucher.signature, {value: minPrice}))
      .to.emit(contract, 'Transfer')  // transfer from null address to minter
      .withArgs('0x0000000000000000000000000000000000000000', minter.address, voucher.voucher.tokenId)
      .and.to.emit(contract, 'Transfer') // transfer from minter to redeemer
      .withArgs(minter.address, redeemer.address, voucher.voucher.tokenId)

    });
  })

});
