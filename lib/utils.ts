import { ethers } from "hardhat";

export const getDefaultSigners = async () => {
    const defaultSigners = await ethers.getSigners();
    return {
      admin: defaultSigners[0],
      user: defaultSigners[1],
      user2: defaultSigners[2],
      treasury: defaultSigners[3],
      grant: defaultSigners[4],
    };
  };

  