import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Sparkles, Users, Shield, Coins } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Home = () => {
  const [stats, setStats] = useState({
    projectsFunded: 0,
    totalDistributed: '0',
    activeVoters: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      const projects = response.data;
      const funded = projects.filter((p: any) => p.status === 'successful').length;
      const activeVoting = projects.filter((p: any) => p.status === 'active_voting').length;
      
      setStats({
        projectsFunded: funded,
        totalDistributed: '0', // Would need contract event tracking
        activeVoters: activeVoting
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-6xl font-bold text-white mb-6">
          Decentralized Micro-Grant
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Funding Platform
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Empowering creative projects through community-driven funding, transparent governance, and blockchain technology
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/projects"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Explore Projects
          </Link>
          <Link
            to="/create"
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition border border-white/20"
          >
            Submit Project
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FeatureCard
          icon={<Sparkles className="w-8 h-8" />}
          title="NFT Proposals"
          description="Each project is minted as an NFT, ensuring unique ownership and verifiable authenticity"
        />
        <FeatureCard
          icon={<Users className="w-8 h-8" />}
          title="Community Voting"
          description="Token holders vote on which projects receive funding through transparent governance"
        />
        <FeatureCard
          icon={<Shield className="w-8 h-8" />}
          title="Proof of Contribution"
          description="Earn verifiable credentials for your contributions to funded projects"
        />
        <FeatureCard
          icon={<Coins className="w-8 h-8" />}
          title="Governance Tokens"
          description="Participate in platform decisions and earn rewards for active engagement"
        />
      </section>

      {/* How It Works */}
      <section className="bg-white/5 rounded-2xl p-12 backdrop-blur-sm">
        <h2 className="text-4xl font-bold text-white text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <StepCard
            number="1"
            title="Submit Your Project"
            description="Create a proposal with your project details, goals, and funding requirements"
          />
          <StepCard
            number="2"
            title="Community Votes"
            description="Token holders review and vote on proposals during the voting period"
          />
          <StepCard
            number="3"
            title="Receive Funding"
            description="Approved projects receive micro-grants and community support"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="grid md:grid-cols-3 gap-8 text-center">
        <StatCard value={stats.projectsFunded.toString()} label="Projects Funded" />
        <StatCard value={`${stats.totalDistributed} ETH`} label="Total Distributed" />
        <StatCard value={stats.activeVoters.toString()} label="Active Proposals" />
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition">
    <div className="text-purple-400 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }: { number: string; title: string; description: string }) => (
  <div className="text-center">
    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
      {number}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
      {value}
    </div>
    <div className="text-gray-400">{label}</div>
  </div>
);

export default Home;
