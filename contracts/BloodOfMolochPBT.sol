// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chiru-labs/pbt/src/PBTSimple.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

error MintNotOpen();
error TotalSupplyReached();
error CannotUpdateDeadline();
error CannotMakeChanges();
error NoClaimToken();

contract BloodOfMolochPBT is PBTSimple, Ownable, IERC721Receiver {
    uint256 public immutable TOTAL_SUPPLY; // TODO: set to inventory amount
    uint256 public supply;
    uint256 public changeDeadline;
    bool public canMint;

    string private _baseTokenURI;
    IERC721 private _claimToken;

    constructor(string memory name_, string memory symbol_, uint256 totalSupply)
        PBTSimple(name_, symbol_)
    {
        TOTAL_SUPPLY = totalSupply;
    }

    function mint(
        bytes calldata signatureFromChip,
        uint256 blockNumberUsedInSig
    ) external {
        if (!canMint) {
            revert MintNotOpen();
        }
        if (supply == TOTAL_SUPPLY) {
            revert TotalSupplyReached();
        }
        if (address(_claimToken) == address(0)) {
            revert NoClaimToken();
        }
        _mintTokenWithChip(signatureFromChip, blockNumberUsedInSig);
        unchecked {
            ++supply;
        }
    }

    function seedChipToTokenMapping(
        address[] calldata chipAddresses,
        uint256[] calldata tokenIds,
        bool throwIfTokenAlreadyMinted
    ) external onlyOwner {
        _seedChipToTokenMapping(
            chipAddresses,
            tokenIds,
            throwIfTokenAlreadyMinted
        );
    }

    function updateChips(
        address[] calldata chipAddressesOld,
        address[] calldata chipAddressesNew
    ) external onlyOwner {
        if (changeDeadline != 0 && block.timestamp > changeDeadline) {
            revert CannotMakeChanges();
        }
        _updateChips(chipAddressesOld, chipAddressesNew);
    }

    function openMint() external onlyOwner {
        canMint = true;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function setChangeDeadline(uint256 timestamp) external onlyOwner {
        if (changeDeadline != 0) {
            revert CannotUpdateDeadline();
        }
        changeDeadline = timestamp;
    }

    function setClaimToken(address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), "BloodOfMoloch: null address");
        require(address(_claimToken) == address(0), "BloodOfMoloch: claim token already set");
        _claimToken = IERC721(tokenAddress);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external override pure returns(bytes4) {
        return this.onERC721Received.selector;
    }

    function _receiveAndBurnClaimToken(address chipAddress) internal {
        // TODO
    }
}