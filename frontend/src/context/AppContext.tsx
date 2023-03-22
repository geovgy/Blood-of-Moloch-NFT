import React, { useContext, useState, createContext } from "react";
const AppContext = createContext({});

const AppStateProvider = ({ children }: any): any => {
  const [claimTokenId, setClaimTokenId] = useState<string>("");
  const [blockHashUsedInSig, setBlockHashUsedInSig] = useState<string | null>(
    null
  );
  const [signatureFromChip, setSignatureFromChip] = useState<string | null>(
    null
  );
  const [chipPublicKey, setChipPublicKey] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  const appState = {
    claimTokenId,
    setClaimTokenId,
    blockHashUsedInSig,
    setBlockHashUsedInSig,
    signatureFromChip,
    setSignatureFromChip,
    chipPublicKey,
    setChipPublicKey,
    isApproved,
    setIsApproved,
  };
  return <AppContext.Provider value={appState}>{children}</AppContext.Provider>;
};

const useAppState = (): any => {
  return useContext(AppContext);
};

export { useAppState, AppStateProvider };
