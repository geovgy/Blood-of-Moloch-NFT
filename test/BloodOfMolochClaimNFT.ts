import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from 'hardhat';
import { LazyMinter } from'../lib/lazyMinter';
import { BloodOfMolochClaimNFT } from '../types';

describe("Claim NFT", function() {
  async function deploy() {
    const [minter, mockPBT, rando] = await ethers.getSigners();
  
    let factory = await ethers.getContractFactory("BloodOfMolochClaimNFT", minter)
    const contract = await factory.deploy(minter.address, mockPBT.address) as BloodOfMolochClaimNFT;
  
    return {
      minter,
      mockPBT,
      rando,
      contract,
    }
  }

  let minPrice = ethers.utils.parseEther(".001");
  const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
  const BASE_URI = "ipfs://bafybeia2wrcgdy7kux3q32anm4c4t2khagvaaz2vceg6ofptjgdj3xd6s4/";
  let addresses: string[]

  it("Should deploy", async function() {
    const signers = await ethers.getSigners();
    const minter = signers[0];
    addresses = signers.map(signer => signer.address)

    const LazyNFT = await ethers.getContractFactory("BloodOfMolochClaimNFT");
    const lazynft = await LazyNFT.deploy(minter.address, signers[1].address);
    await lazynft.deployed();
  });

  it("Should mint an NFT from minter role", async function() {
    const { contract, mockPBT, minter } = await deploy()

    const receipt = contract.connect(minter).mint(minter.address)

    const tokenId = 0
    await expect(receipt)
      .to.emit(contract, "Minted").withArgs(tokenId)
      .and.to.emit(contract, "Transfer").withArgs(NULL_ADDRESS, minter.address, tokenId)
  });

  it("Should revert mint if not minter role", async function () {
    const { contract, mockPBT, minter, rando } = await deploy()

    const receipt = contract.connect(rando).mint(rando.address)

    await expect(receipt)
      .to.be.reverted
  })

  it("Should batchMint quantity of NFTs as minter role", async function () {
    const { contract, mockPBT, minter } = await deploy()

    const recipients = addresses.slice(1,11)
    const receipt = contract.connect(minter).batchMint(recipients)

    for(let i=0; i < recipients.length; i++) {
      await expect(receipt)
        .to.emit(contract, "Minted").withArgs(i)
        .and.to.emit(contract, "Transfer").withArgs(NULL_ADDRESS, recipients[i], i)
    }
  })

  it("Should revert batchMint if not minter role", async function () {
    const { contract, mockPBT, minter, rando } = await deploy()

    const recipients = addresses.slice(1,11)
    const receipt = contract.connect(rando).batchMint(recipients)

    await expect(receipt)
      .to.be.reverted
  })

	it("Should revert mint/batchMint if supply is 350", async function () {
		const { contract, mockPBT, minter } = await deploy()

    const multi = [...addresses, ...addresses, ...addresses, ...addresses, ...addresses]
    // const recipients = [...multi, ...multi, ...multi, ...addresses, ...addresses, ...addresses.slice(0,10)]
    const recipients = [...multi, ...multi, ...multi]
    await contract.connect(minter).batchMint(recipients)

		let revertedTx = contract.connect(minter).mint(addresses[0])
		await expect(revertedTx).to.be.revertedWith("BloodOfMolochClaimNFT: cannot exceed max supply")

		revertedTx = contract.connect(minter).batchMint(addresses)
		await expect(revertedTx).to.be.revertedWith("BloodOfMolochClaimNFT: cannot exceed max supply")
	})

	it("Should burn if operator is PBT", async function () {
		const { contract, mockPBT, minter } = await deploy()
		await contract.connect(minter).mint(addresses[0])

		const tokenId = 0
		const receipt = contract.connect(mockPBT).burn(tokenId)

		await expect(receipt).to.not.be.reverted
	})

	it("Should revert burn if not PBT or token owner", async function () {
		const { contract, mockPBT, minter, rando } = await deploy()
		await contract.connect(minter).mint(addresses[0])

		const tokenId = 1
		const receipt = contract.connect(rando).burn(tokenId)

		await expect(receipt).to.be.reverted
	})

  it("Should make payments available to minter for withdrawal", async function() {
    const { contract, rando, minter } = await deploy()
		
		await rando.sendTransaction({
			to: contract.address,
			value: minPrice,
		})

    // minter should have funds available to withdraw
    expect(await contract.availableToWithdraw()).to.equal(minPrice)

    // withdrawal should increase minter's balance
    await expect(await contract.withdraw())
      .to.changeEtherBalance(minter, minPrice)

    // minter should now have zero available
    expect(await contract.availableToWithdraw()).to.equal(0)
  });

	it("Should revert withdraw if not minter", async function () {
		const { contract, rando, minter } = await deploy()
		
		await rando.sendTransaction({
			to: contract.address,
			value: minPrice,
		})

    // minter should have funds available to withdraw
    expect(await contract.availableToWithdraw()).to.equal(minPrice)
		const receipt = contract.connect(rando).withdraw()

    // withdrawal should increase minter's balance
    await expect(receipt).to.be.revertedWith("Only authorized minters can withdraw")

    // minter should now have zero available
    expect(await contract.availableToWithdraw()).to.equal(minPrice)
	})

	it("Should mint to user if msg.value >= min price", async function () {
		const { contract, rando, minter } = await deploy()

		const receipt = contract.connect(rando).mintClaimToken({ value: parseEther("0.07") })
		await expect(receipt).to.emit(contract, "Minted").withArgs(0)
	})

	it("Should revert mint if below min price", async function () {
		const { contract, rando, minter } = await deploy()

		const receipt = contract.connect(rando).mintClaimToken({ value: parseEther("0.01") })
		await expect(receipt).to.be.revertedWith("BloodOfMolochClaimNFT: msg.value below min price")
	})

	it("Should batch mint to user if msg.value >= min price", async function () {
		const { contract, rando, minter } = await deploy()

		const quantity = 3
		const receipt = contract.connect(rando).batchMintClaimTokens(quantity, { value: parseEther("0.21") })
		for(let i=0; i < quantity; i++) {
      await expect(receipt)
        .to.emit(contract, "Minted").withArgs(i)
        .and.to.emit(contract, "Transfer").withArgs(NULL_ADDRESS, rando.address, i)
    }
	})

	it("Should revert mint if below min price", async function () {
		const { contract, rando, minter } = await deploy()

		const quantity = 3
		const receipt = contract.connect(rando).batchMintClaimTokens(quantity, { value: parseEther("0.14") })
		await expect(receipt).to.be.revertedWith("BloodOfMolochClaimNFT: msg.value below min price")
	})

  it("Should setMinPrice as minter role", async function () {
    const { contract, rando, minter } = await deploy()

    expect(await contract.MIN_PRICE()).to.equal(parseEther("0.069"))
		const receipt = contract.connect(minter).setMinPrice(parseEther("0.096"))
		await expect(receipt).to.be.not.reverted
    expect(await contract.MIN_PRICE()).to.equal(parseEther("0.096"))
  })

  it("Should revert setMinPrice if not minter role", async function () {
    const { contract, rando, minter } = await deploy()

		const receipt = contract.connect(rando).setMinPrice(parseEther("0.096"))
		await expect(receipt).to.be.reverted
  })

  it("Should return tokenURI with correct output (with .json)", async function () {
    const { contract, rando, minter } = await deploy()

		const receipt = contract.connect(rando).mintClaimToken({ value: parseEther("0.07") })
		await expect(receipt).to.emit(contract, "Minted").withArgs(0)

    const tokenUri = await contract.tokenURI(0)
    console.log(tokenUri)
    expect(tokenUri).to.equal(`ipfs://bafybeia2wrcgdy7kux3q32anm4c4t2khagvaaz2vceg6ofptjgdj3xd6s4/${0}.json`)
  })

  it("Should setBaseURI as minter role", async function () {
    const { contract, rando, minter } = await deploy()

		const receipt = contract.connect(minter).setBaseURI("ipfs://<CID>/")
		await expect(receipt).to.not.be.reverted

    contract.connect(rando).mintClaimToken({ value: parseEther("0.07") })
    const tokenUri = await contract.tokenURI(0)
    console.log(tokenUri)
    expect(tokenUri).to.equal(`ipfs://<CID>/${0}.json`)
  })

  it("Should revert setBaseURI if not minter role", async function () {
    const { contract, rando, minter } = await deploy()

		const receipt = contract.connect(rando).setBaseURI("ipfs://<CID>/")
		await expect(receipt).to.be.reverted
  })

  it("Should setMaxSupply as minter role", async function () {
    const { contract, rando, minter } = await deploy()

		const receipt = contract.connect(minter).setMaxSupply(800)
		await expect(receipt).to.not.be.reverted
    expect(await contract.MAX_SUPPLY()).to.equal(800)
  })

  it("Should revert setMaxSupply if not minter role", async function () {
    const { contract, rando, minter } = await deploy()

    const receipt = contract.connect(rando).setMaxSupply(800)
		await expect(receipt).to.be.reverted
    expect(await contract.MAX_SUPPLY()).to.equal(300)
  })
});
