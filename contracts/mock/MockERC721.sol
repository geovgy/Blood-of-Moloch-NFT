// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../IERC721Burnable.sol";

contract MockERC721 is ERC721, IERC721Burnable {
    constructor() ERC721("MockERC721", "MOCK") {}

    function burn(uint256 tokenId) external {
        _burn(tokenId);
    }
}