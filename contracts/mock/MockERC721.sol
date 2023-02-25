// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../IBurnable.sol";

contract MockERC721 is ERC721, IBurnable {
    constructor() ERC721("MockERC721", "MOCK") {}

    function burn(uint256 tokenId) external {
        _burn(tokenId);
    }
}