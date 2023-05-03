// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import 'hardhat/console.sol';
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./interfaces/IBurnable.sol";
import "./interfaces/IPBT.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

error MintNotOpen();
error TotalSupplyReached();
error CannotUpdateDeadline();
error CannotMakeChanges();
error NoClaimToken();

error InvalidSignature();
error InvalidFunction();
error InvalidChipAddress();
error NoMintedTokenForChip();
error ChipAlreadyLinkedToMintedToken();
error InvalidBlockNumber();
error BlockNumberTooOld();

contract BloodOfMolochMerklePBT is ERC721, ReentrancyGuard, Ownable  {

    using Counters for Counters.Counter;
    using MerkleProof for bytes32[];
    using ECDSA for bytes32;

    uint256 public supply;
    uint256 public changeDeadline;
    bool public canMint;

    bytes32 public merkleRoot;

    string private _baseTokenURI;
    address private _claimToken;

    event Burn (
        address indexed from,
        uint256 tokenId,
        address indexed claimToken
    );

    event PBTMint (uint256 tokenId, address tokenAddr   );

     // Mapping from chipAddress to TokenData
    mapping(address => uint256) _tokenIds;

    // Max token supply
    uint256 public immutable maxSupply;

    // Data structure used for Fisher Yates shuffle
    mapping(uint256 => uint256) internal _availableRemainingTokens;

    //initialize counter
    Counters.Counter private _tokenIdCounter;

    constructor(uint256 _maxSupply) ERC721("Blood of Moloch", "BoM") {
        maxSupply = _maxSupply;
        _tokenIdCounter.increment();
    }

    function mint(
        uint256 claimTokenId,
        bytes calldata signatureFromChip,
        uint256 blockHashUsedInSig,
        bytes32 [] calldata proof
    ) external nonReentrant {   
        if (!canMint) {
            revert MintNotOpen();
        }
        if (_tokenIdCounter.current() == maxSupply) {
            revert TotalSupplyReached();
        }
        if (_claimToken == address(0)) {
            revert NoClaimToken();
        }
        require(IERC721(_claimToken).ownerOf(claimTokenId) == _msgSender(), "BloodOfMoloch: not owner of claim token");
        require(
            IERC721(_claimToken).isApprovedForAll(_msgSender(), address(this)) || IERC721(_claimToken).getApproved(claimTokenId) == address(this),
            "BloodOfMoloch: not approved"
        );
        _mintTokenWithChip(signatureFromChip, blockHashUsedInSig, proof);
        _burnClaimToken(claimTokenId);
    }

    function setMerkleRoot(bytes32 _newRoot) external onlyOwner{
        merkleRoot = _newRoot;
    }

    /**************************************
     *        Only Owner Functions        *
     **************************************/
    

    function openMint() external onlyOwner {
        require(bytes(_baseTokenURI).length > 0, "BloodOfMoloch: no base URI");
        require(merkleRoot != bytes32(0), "Merkle root not set");
        require(_claimToken != address(0), "BloodOfMoloch: no claim token");

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
        _claimToken = tokenAddress;
    }

    /**************************************
     *        Internal Functions          *
     **************************************/

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function _burnClaimToken(uint256 tokenId) internal {
        IBurnable(_claimToken).burn(tokenId);
        emit Burn(_msgSender(), tokenId, _claimToken);
    }

      /**************************************
     *        Merkle PBT Functions          *
     **************************************/

      function tokenIdFor(address chipAddress) external view  returns (uint256) {
        if (_exists(_tokenIds[chipAddress]) == false) {
            revert NoMintedTokenForChip();
        }
        return _tokenIds[chipAddress];
    }

    // Returns true if the signer of the signature of the payload is the chip for the token id
    function isChipSignatureForToken(uint256 tokenId, bytes memory payload, bytes memory signature)
        public
        view
        returns (bool isForToken)
    {
        if (!_exists(tokenId)) {
            revert NoMintedTokenForChip();
        }
        bytes32 signedHash = keccak256(payload).toEthSignedMessageHash();
        address chipAddr = signedHash.recover(signature);
        isForToken = _exists(_tokenIds[chipAddr]);
    }

    // Parameters:
    //    to: the address of the new owner
    //    signatureFromChip: signature(receivingAddress + recentBlockhash), signed by an approved chip
    //
    // Contract should check that (1) recentBlockhash is a recent blockhash, (2) receivingAddress === to, and (3) the signing chip is allowlisted.
    function _mintTokenWithChip(bytes memory signatureFromChip, uint256 blockNumberUsedInSig, bytes32[] memory proof)
        internal
        returns (uint256)
    {
        //recover chip address from signed message
        address chipAddr = _getChipAddrForChipSignature(signatureFromChip, blockNumberUsedInSig);
        // hash chip address for merkle proof double hashed to prevent second preimage attacks
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(chipAddr))));
        if (_exists(_tokenIds[chipAddr])) {
            revert ChipAlreadyLinkedToMintedToken();
        } else if (proof.verify(merkleRoot, leaf) == false ) {
            revert InvalidChipAddress();
        }
        uint256 tokenId = _tokenIdCounter.current();
        _mint(_msgSender(), tokenId);
        _tokenIds[chipAddr] = tokenId;

        _tokenIdCounter.increment();

        emit PBTMint(tokenId, chipAddr);

        return tokenId;
    }


    function transferTokenWithChip(bytes calldata signatureFromChip, uint256 blockNumberUsedInSig) public  {
        transferTokenWithChip(signatureFromChip, blockNumberUsedInSig, false);
    }

    function transferTokenWithChip(
        bytes calldata signatureFromChip,
        uint256 blockNumberUsedInSig,
        bool useSafeTransferFrom
    ) public  {
        _transferTokenWithChip(signatureFromChip, blockNumberUsedInSig, useSafeTransferFrom);
    }

    function _transferTokenWithChip(
        bytes calldata signatureFromChip,
        uint256 blockNumberUsedInSig,
        bool useSafeTransferFrom
    ) internal virtual {
        uint256 tokenId = _getTokenIdForChipSignature(signatureFromChip, blockNumberUsedInSig);
        if (useSafeTransferFrom) {
            _safeTransfer(ownerOf(tokenId), _msgSender(), tokenId, "");
        } else {
            _transfer(ownerOf(tokenId), _msgSender(), tokenId);
        }
    }

    function _getTokenIdForChipSignature(bytes calldata signatureFromChip, uint256 blockNumberUsedInSig)
        internal
        view
        returns (uint256 tokenId)
    {
        address chipAddr = _getChipAddrForChipSignature(signatureFromChip, blockNumberUsedInSig);
        tokenId = _tokenIds[chipAddr];
        if (_exists(tokenId)) {
            return tokenId;
        }
        revert InvalidSignature();
    }

    function _getChipAddrForChipSignature(bytes memory signatureFromChip, uint256 blockNumberUsedInSig)
        internal
        view
        returns (address)
    {
        // The blockNumberUsedInSig must be in a previous block because the blockhash of the current
        // block does not exist yet.
        if (block.number <= blockNumberUsedInSig) {
            revert InvalidBlockNumber();
        }

        if (block.number - blockNumberUsedInSig > getMaxBlockhashValidWindow()) {
            revert BlockNumberTooOld();
        }

        bytes32 blockHash = blockhash(blockNumberUsedInSig);
        bytes32 signedHash = keccak256(abi.encodePacked(_msgSender(), blockHash)).toEthSignedMessageHash();
        return signedHash.recover(signatureFromChip);
    }

    function getMaxBlockhashValidWindow() public pure virtual returns (uint256) {
        return 100;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IPBT).interfaceId || super.supportsInterface(interfaceId);
    }

    /**  OPEN ZEPPELIN TRANSFER OVERRIDES */

    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
        revert InvalidFunction();
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override {
       revert InvalidFunction();
    }

    function transferFrom(address from, address to, uint256 tokenId) public virtual override {      
        revert InvalidFunction();
    }

}
