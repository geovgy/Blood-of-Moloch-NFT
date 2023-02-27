import React, { useContext, useEffect, useState, createContext } from "react";
const AppContext = createContext({});

const AppStateProvider = ({ children }: any): any => {
  const [claimTokenId, setClaimTokenId] = useState<string>("");
  const [blockNumberUsedInSig, setBlockNumberUsedInSig] = useState<string>("");
  const [signatureFromChip, setSignatureFromChip] = useState<string>("");
  const [chipPublicKey, setChipPublicKey] = useState<string>("");
  const [isApproved, setIsApproved] = useState<boolean>(false);

  const appState = {
    claimTokenId,
    setClaimTokenId,
    blockNumberUsedInSig,
    setBlockNumberUsedInSig,
    signatureFromChip,
    setSignatureFromChip,
    chipPublicKey,
    setChipPublicKey,
    isApproved,
    setIsApproved,
  };
  console.log("inside appState.tsx");
  return <AppContext.Provider value={appState}>{children}</AppContext.Provider>;
};

const useAppState = (): any => {
  return useContext(AppContext);
};

export { useAppState, AppStateProvider };
