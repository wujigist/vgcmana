import AppRoutes from "./routes";
import { AuthProvider } from "@/context/AuthContext";
import { InvestmentProvider } from "@/context/InvestmentContext";
import { WalletProvider } from "@/context/WalletContext";
import { BrowserRouter } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InvestmentProvider>
          <WalletProvider>
            <Navbar />
            <AppRoutes />
          </WalletProvider>
        </InvestmentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
