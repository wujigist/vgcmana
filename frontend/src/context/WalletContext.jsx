import { createContext, useContext, useState } from "react";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(0);

  const deposit = (amount) => setBalance((b) => b + amount);
  const withdraw = (amount) => setBalance((b) => Math.max(b - amount, 0));

  return (
    <WalletContext.Provider value={{ balance, deposit, withdraw }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
