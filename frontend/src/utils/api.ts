import axios from "axios";

const getWalletClaimNFTs = async (walletAddress: string) => {
  const { data } = await axios.get(
    `https://api.covalenthq.com/v1/mainnet/address/${walletAddress}/balances_nft/`
  );
  return data;
};

export default getWalletClaimNFTs;
