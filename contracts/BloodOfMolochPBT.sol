// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chiru-labs/pbt/src/PBTSimple.sol";
import "./IERC721Burnable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error MintNotOpen();
error TotalSupplyReached();
error CannotUpdateDeadline();
error CannotMakeChanges();
error NoClaimToken();

contract BloodOfMolochPBT is PBTSimple, Ownable, ReentrancyGuard {
    uint256 public immutable TOTAL_SUPPLY;
    uint256 public supply;
    uint256 public changeDeadline;
    bool public canMint;

    string private _baseTokenURI;
    IERC721Burnable private _claimToken;

    constructor(string memory name_, string memory symbol_, uint256 totalSupply)
        PBTSimple(name_, symbol_)
    {
        TOTAL_SUPPLY = totalSupply;
    }

    function mint(
        uint256 claimTokenId,
        bytes calldata signatureFromChip,
        uint256 blockNumberUsedInSig
    ) external nonReentrant {
        if (!canMint) {
            revert MintNotOpen();
        }
        if (supply == TOTAL_SUPPLY) {
            revert TotalSupplyReached();
        }
        if (address(_claimToken) == address(0)) {
            revert NoClaimToken();
        }
        _burnClaimToken(_msgSender(), claimTokenId);
        _mintTokenWithChip(signatureFromChip, blockNumberUsedInSig);
        unchecked {
            ++supply;
        }
    }

    /**************************************
     *        Only Owner Functions        *
     **************************************/

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
        require(bytes(_baseTokenURI).length > 0, "BloodOfMoloch: no base URI");
        require(address(_claimToken) != address(0), "BloodOfMoloch: no claim token");
        canMint = true;
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
        _claimToken = IERC721Burnable(tokenAddress);
    }

    /**************************************
     *        Internal Functions          *
     **************************************/

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function _burnClaimToken(address user, uint256 tokenId) internal {
        require(_claimToken.ownerOf(tokenId) == user, "BloodOfMoloch: not owner of claim token");
        _claimToken.burn(tokenId);
    }
}