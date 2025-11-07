import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const { user, login, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuth = async () => {
    if (!account) {
      await connectWallet();
    } else if (!user) {
      await login();
    } else {
      logout();
      disconnectWallet();
    }
  };

  const getButtonText = () => {
    if (isConnecting) return 'Connecting...';
    if (!account) return 'Connect Wallet';
    if (isLoading) return 'Authenticating...';
    if (!user) return 'Sign In';
    return `${account.slice(0, 6)}...${account.slice(-4)}`;
  };

  return (
    <nav className="bg-gray-900/50 backdrop-blur-lg border-b border-purple-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
            <span className="text-xl font-bold text-white">DMCGP</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/projects" className="text-gray-300 hover:text-white transition">
              Projects
            </Link>
            <Link to="/governance" className="text-gray-300 hover:text-white transition">
              Governance
            </Link>
            {user && (
              <>
                <Link to="/create" className="text-gray-300 hover:text-white transition">
                  Create Project
                </Link>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition">
                  Dashboard
                </Link>
              </>
            )}
            <button
              onClick={handleAuth}
              disabled={isConnecting || isLoading}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {user ? <LogOut size={18} /> : <Wallet size={18} />}
              <span>{getButtonText()}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              to="/projects"
              className="block text-gray-300 hover:text-white transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Projects
            </Link>
            <Link
              to="/governance"
              className="block text-gray-300 hover:text-white transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Governance
            </Link>
            {user && (
              <>
                <Link
                  to="/create"
                  className="block text-gray-300 hover:text-white transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Project
                </Link>
                <Link
                  to="/dashboard"
                  className="block text-gray-300 hover:text-white transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            )}
            <button
              onClick={() => {
                handleAuth();
                setMobileMenuOpen(false);
              }}
              disabled={isConnecting || isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {user ? <LogOut size={18} /> : <Wallet size={18} />}
              <span>{getButtonText()}</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
