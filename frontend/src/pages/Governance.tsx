import { useEffect, useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from '../contexts/AuthContext';
import { ethers } from 'ethers';
import { Coins, Vote, Users, TrendingUp } from 'lucide-react';
import { getTokenBalance } from '../contracts/contractHelpers';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Governance = () => {
  const { account, provider } = useWeb3();
  const { user } = useAuth();
  const [tokenBalance, setTokenBalance] = useState('0');
  const [activeProposals, setActiveProposals] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account && provider) {
      fetchTokenBalance();
    }
    fetchStats();
  }, [account, provider]);

  const fetchTokenBalance = async () => {
    try {
      if (!provider || !account) return;
      const balance = await getTokenBalance(account, provider);
      setTokenBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      const projects = response.data;
      const active = projects.filter((p: any) => p.status === 'active_voting').length;
      setActiveProposals(active);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Governance</h1>
        <p className="text-gray-400">Participate in platform decisions and earn rewards</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Coins />} value="1,000,000" label="Total Supply" />
        <StatCard icon={<Users />} value="-" label="Token Holders" />
        <StatCard icon={<Vote />} value={loading ? '-' : activeProposals.toString()} label="Active Proposals" />
        <StatCard icon={<TrendingUp />} value="-" label="Participation Rate" />
      </div>

      {user && account ? (
        <>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Your Governance Tokens</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                  {parseFloat(tokenBalance).toFixed(2)} DMCG
                </div>
                <p className="text-gray-400">Your voting power</p>
              </div>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                Claim Tokens
              </button>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">How to Earn Tokens</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <EarnCard
                title="Vote on Projects"
                description="Participate in voting to earn governance tokens"
                reward="+10 DMCG"
              />
              <EarnCard
                title="Contribute to Projects"
                description="Help funded projects and earn contribution rewards"
                reward="+50 DMCG"
              />
              <EarnCard
                title="Create Projects"
                description="Submit quality projects that get funded"
                reward="+25 DMCG"
              />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Active Voting Proposals</h2>
            <div className="text-center py-12">
              <p className="text-gray-400">No active governance proposals at the moment</p>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect to Participate</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet and authenticate to participate in governance
          </p>
        </div>
      )}

      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">About Governance Tokens</h2>
        <div className="space-y-4 text-gray-300">
          <p>
            DMCG (DMCGP Governance Token) is the native governance token of the platform. Token holders can:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Vote on project proposals to determine funding allocation</li>
            <li>Participate in platform governance decisions</li>
            <li>Earn rewards for active participation and contributions</li>
            <li>Build reputation through the Proof-of-Contribution system</li>
          </ul>
          <p className="text-sm text-gray-400 mt-4">
            Your voting power is calculated based on your token balance plus your contribution weight from verified credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
    <div className="text-purple-400 mb-2">{icon}</div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-gray-400 text-sm">{label}</div>
  </div>
);

const EarnCard = ({ title, description, reward }: { title: string; description: string; reward: string }) => (
  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm mb-4">{description}</p>
    <div className="text-purple-400 font-semibold">{reward}</div>
  </div>
);

export default Governance;
