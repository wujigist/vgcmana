import { useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu

  // 1. Use useLocation to get the current path
  const location = useLocation();

  // 2. Conditional return: Do not render the navbar if the path is the root "/"
  if (location.pathname === "/") {
    return null;
  }

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false); // Function to close menu after navigation

  // Define navigation links based on user role and authentication state
  const navLinks = useAuth ? [
    ...(user && user.role !== "admin"
      ? [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/wallet", label: "Wallet" },
          { to: "/investments", label: "Investments" },
          { to: "/profile", label: "Profile" },
        ]
      : []),
    ...(user && user.role === "admin"
      ? [
          { to: "/admin", label: "Admin Dashboard" },
          { to: "/admin/users", label: "Users" },
          { to: "/admin/wallets", label: "Wallets" },
          { to: "/admin/transactions", label: "Transactions" },
          { to: "/admin/investments", label: "Investments" },
        ]
      : []),
    ...(!user
      ? [
          { to: "/", label: "Home" },
          { to: "/login", label: "Login" },
          { to: "/register", label: "Register" },
        ]
      : []),
  ] : [];


  return (
    <nav className="bg-gray-900 shadow-xl sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand (Updated to VGC) */}
          <Link to="/" className="text-2xl font-extrabold text-blue-400 tracking-wider" onClick={closeMenu}>
            VGC
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Logout button for desktop */}
            {user && (
              <button
                onClick={() => { logout(); closeMenu(); }}
                className="ml-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm font-medium transition duration-150"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed/open */}
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Links (Hidden by default, shown when isOpen is true) */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link 
              key={link.to} 
              to={link.to} 
              onClick={closeMenu}
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition duration-150"
            >
              {link.label}
            </Link>
          ))}
          
          {/* Logout button for mobile */}
          {user && (
            <button
              onClick={() => { logout(); closeMenu(); }}
              className="w-full text-left bg-red-600 hover:bg-red-700 text-white block px-3 py-2 rounded-md text-base font-medium mt-1"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
