// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.9;
// pragma abicoder v2; // required to accept structs as function parameters

// import "hardhat/console.sol";

// // import "../ERC721URIStorage.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";
// import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
// import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
// // import "../IBurnable.sol";

// contract OldBloodOfMolochClaimNFT is
//     ERC721URIStorage,
//     EIP712,
//     AccessControl,
//     IBurnable
// {
//     address private PBT_ADDRESS;
//     bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
//     string private constant SIGNING_DOMAIN = "BloodOfMolochClaimVoucher";
//     string private constant SIGNATURE_VERSION = "1";

//     // pre calculated to save gas keccak256("NFTVoucher(uint256 tokenId,string uri,uint256 minPrice)")
//     bytes32 private constant TYPE_HASH =
//         0xc313c44abe7b9471f6e6151a39dadc2293e741d2f166ce98e663dd1a49208461;

//     /// @dev Event to emit on signature mint with the `tokenId`.
//     event MintedUsingSignature(uint256 tokenId);

//     mapping(address => uint256) pendingWithdrawals;

//     /**
//      * @dev Mapping to hold the state if token is minted. This is used to verify if a voucher
//      * has been used or not.
//      */
//     mapping(uint256 => bool) private minted;

//     constructor(address payable minter, address pbtAddress)
//         ERC721("Blood of Moloch Claim", "BLMC")
//         EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION)
//     {
//         require(pbtAddress != address(0), "BloodOfMolochClaimNFT: null address");
//         _setupRole(MINTER_ROLE, minter);
//         PBT_ADDRESS = pbtAddress;
//     }

//     /// @notice Represents an un-minted NFT, which has not yet been recorded into the blockchain. A signed voucher can be redeemed for a real NFT using the redeem function.
//     struct NFTVoucher {
//         /// @notice The id of the token to be redeemed. Must be unique - if another token with this ID already exists, the redeem function will revert.
//         uint256 tokenId;
//         /// @notice The metadata URI to associate with this token.
//         string uri;
//         /// @notice The minimum price (in wei) that the NFT creator is willing to accept for the initial sale of this NFT.
//         uint256 minPrice;
//     }

//     /// @notice Redeems an NFTVoucher for an actual NFT, creating it in the process.
//     /// @param redeemer The address of the account which will receive the NFT upon success.
//     /// @param voucher A signed NFTVoucher that describes the NFT to be redeemed.
//     function redeem(
//         address redeemer,
//         NFTVoucher calldata voucher,
//         bytes calldata signature
//     ) public payable returns (uint256) {
//         // make sure signature is valid and get the address of the signer
//         address signer = _verify(voucher, signature);
//         uint256 tokenId = voucher.tokenId;

//         //check that tokenId is within the correct limits
//         require(tokenId < 350, "only 350 claim nft's available");

//         //check that token has not already been minted
//         require(
//             minted[tokenId] == false,
//             "cannot claim an already minted token"
//         );

//         // make sure that the signer is authorized to mint NFTs
//         require(
//             hasRole(MINTER_ROLE, signer),
//             "Signature invalid or unauthorized"
//         );

//         // make sure that the redeemer is paying enough to cover the buyer's cost
//         require(msg.value >= voucher.minPrice, "Insufficient funds to redeem");

//         // first assign the token to the signer, to establish provenance on-chain
//         _mint(signer, tokenId);
//         _setTokenURI(tokenId, voucher.uri);

//         // transfer the token to the redeemer
//         _transfer(signer, redeemer, tokenId);

//         // record payment to signer's withdrawal balance
//         pendingWithdrawals[signer] += msg.value;
//         minted[tokenId] = true;

//         emit MintedUsingSignature(tokenId);

//         return tokenId;
//     }

//     /// @notice Returns a hash of the given NFTVoucher, prepared using EIP712 typed data hashing rules.
//     /// @param voucher An NFTVoucher to hash.
//     function _hash(NFTVoucher calldata voucher)
//         internal
//         view
//         returns (bytes32)
//     {
//         bytes32 STRUCT_HASH = keccak256(
//             abi.encode(
//                 TYPE_HASH,
//                 voucher.tokenId,
//                 keccak256(bytes(voucher.uri)),
//                 voucher.minPrice
//             )
//         );

//         return _hashTypedDataV4(STRUCT_HASH);
//     }

//     /// @notice Verifies the signature for a given NFTVoucher, returning the address of the signer.
//     /// @dev Will revert if the signature is invalid. Does not verify that the signer is authorized to mint NFTs.
//     /// @param voucher An NFTVoucher describing an unminted NFT.
//     function _verify(NFTVoucher calldata voucher, bytes calldata signature)
//         internal
//         view
//         returns (address)
//     {
//         bytes32 digest = _hash(voucher);
//         address recoveredAddress = ECDSA.recover(digest, signature);

//         return recoveredAddress;
//     }

//     function getChainID() external view returns (uint256) {
//         uint256 id;
//         assembly {
//             id := chainid()
//         }
//         return id;
//     }

//     function supportsInterface(bytes4 interfaceId)
//         public
//         view
//         virtual
//         override(AccessControl, ERC721)
//         returns (bool)
//     {
//         return
//             ERC721.supportsInterface(interfaceId) ||
//             AccessControl.supportsInterface(interfaceId);
//     }

//     /// @notice Transfers all pending withdrawal balance to the caller. Reverts if the caller is not an authorized minter.
//     function withdraw() public {
//         require(
//             hasRole(MINTER_ROLE, msg.sender),
//             "Only authorized minters can withdraw"
//         );

//         // IMPORTANT: casting msg.sender to a payable address is only safe if ALL members of the minter role are payable addresses.
//         address payable receiver = payable(msg.sender);

//         uint256 amount = pendingWithdrawals[receiver];
//         // zero account before transfer to prevent re-entrancy attack
//         pendingWithdrawals[receiver] = 0;
//         receiver.transfer(amount);
//     }

//     /// @notice Retuns the amount of Ether available to the caller to withdraw.
//     function availableToWithdraw() public view returns (uint256) {
//         return pendingWithdrawals[msg.sender];
//     }

//     /**
//      * @dev Burns `tokenId`. See {ERC721-_burn}.
//      *
//      * Requirements:
//      *
//      * - The caller must own `tokenId` or be an approved operator.
//      */
//     function burn(uint256 tokenId) public virtual override {
//         //solhint-disable-next-line max-line-length
//         require(
//             _isApprovedOrOwner(_msgSender(), tokenId),
//             "ERC721: caller is not token owner or approved"
//         );
//         _burn(tokenId);
//     }

//     /**
//      * @dev See {IERC721-isApprovedForAll}.
//      */
//     function isApprovedForAll(address owner, address operator) public view override returns (bool) {
//         if (operator == PBT_ADDRESS) {
//             return true;
//         }
//         return _operatorApprovals[owner][operator];
//     }
// }
