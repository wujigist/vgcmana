import { createContext, useContext, useState } from "react";

const InvestmentContext = createContext();

export function InvestmentProvider({ children }) {
  const [investments, setInvestments] = useState([]);

  const addInvestment = (inv) => setInvestments((prev) => [...prev, inv]);

  return (
    <InvestmentContext.Provider value={{ investments, addInvestment }}>
      {children}
    </InvestmentContext.Provider>
  );
}

export const useInvestments = () => useContext(InvestmentContext);
