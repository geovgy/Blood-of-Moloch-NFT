// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../interfaces/IBurnable.sol";

contract MockERC721 is ERC721, IBurnable {
    uint public supply;

    constructor() ERC721("MockERC721", "MOCK") {}

    function mint(address to) external {
        supply += 1;
        _mint(to, supply);
    }

    function burn(uint256 tokenId) external {
        _burn(tokenId);
    }
}