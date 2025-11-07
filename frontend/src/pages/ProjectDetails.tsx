import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { User, Clock, ExternalLink, Vote, Heart, TrendingUp, Coins } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Project {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: string;
  creator: {
    walletAddress: string;
    username?: string;
  };
  createdAt: string;
  nftTokenId?: number;
  ipfsCid?: string;
}

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { provider, account } = useWeb3();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('0.1');
  const [voteAmount, setVoteAmount] = useState('10');
  const [isVoting, setIsVoting] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [stats, setStats] = useState<{
    totalVotes: string;
    totalDonations: string;
    donorCount: number;
  } | null>(null);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  useEffect(() => {
    if (project?.nftTokenId !== undefined && project?.nftTokenId !== null) {
      fetchProjectStats();
    }
  }, [project?.nftTokenId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/${id}`);
      console.log('Fetched project:', response.data);
      console.log('Project imageUrl:', response.data.imageUrl);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/${id}/stats`);
      if (response.data.success && response.data.votingStarted) {
        setStats({
          totalVotes: response.data.totalVotes,
          totalDonations: response.data.totalDonations,
          donorCount: response.data.donorCount,
        });
      } else if (response.data.success && !response.data.votingStarted) {
        // Voting hasn't started yet, set stats to zero
        setStats({
          totalVotes: '0',
          totalDonations: '0',
          donorCount: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching project stats:', error);
      // On error, set default stats
      setStats({
        totalVotes: '0',
        totalDonations: '0',
        donorCount: 0,
      });
    }
  };

  const handleVote = async () => {
    if (!provider || !account || !user) {
      toast.error('Please connect your wallet and sign in');
      return;
    }

    if (project?.nftTokenId === undefined || project?.nftTokenId === null) {
      toast.error('Project NFT not yet minted');
      return;
    }

    setIsVoting(true);
    const loadingToast = toast.loading('Preparing vote...');

    try {
      // Get contribution signature from backend
      const token = localStorage.getItem('token');
      const signatureResponse = await axios.post(
        `${API_URL}/contributions/signature`,
        {
          nftId: project.nftTokenId,
          contributorAddress: account,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { contributionWeight, signature } = signatureResponse.data;
      const signer = await provider.getSigner();
      const grantManagerAddress = import.meta.env.VITE_CONTRACT_ADDRESS_GRANT_MANAGER;
      const governanceTokenAddress = import.meta.env.VITE_CONTRACT_ADDRESS_GOVERNANCE_TOKEN;

      if (!grantManagerAddress || !governanceTokenAddress) {
        throw new Error('Contract addresses not configured');
      }

      const baseVoteAmount = ethers.parseEther(voteAmount);

      // First, approve the GrantManager to spend governance tokens
      const govTokenABI = ['function approve(address spender, uint256 amount) returns (bool)'];
      const govToken = new ethers.Contract(governanceTokenAddress, govTokenABI, signer);

      toast.loading('Approving token spend...', { id: loadingToast });
      const approveTx = await govToken.approve(grantManagerAddress, baseVoteAmount);
      await approveTx.wait();

      // Cast the vote
      const grantManagerABI = [
        'function castVote(uint256 _nftId, uint256 _baseVoteAmount, uint256 _contributionWeight, bytes _signature) public'
      ];
      const grantManager = new ethers.Contract(grantManagerAddress, grantManagerABI, signer);

      toast.loading('Casting vote...', { id: loadingToast });
      const voteTx = await grantManager.castVote(
        project.nftTokenId,
        baseVoteAmount,
        contributionWeight,
        signature
      );
      await voteTx.wait();

      toast.success(`Vote cast successfully with ${voteAmount} tokens + ${contributionWeight} contribution weight!`, { id: loadingToast });
      
      // Refresh stats after voting
      fetchProjectStats();
    } catch (error: any) {
      console.error('Voting error:', error);
      toast.error(error?.reason || error?.message || 'Failed to cast vote', { id: loadingToast });
    } finally {
      setIsVoting(false);
    }
  };

  const handleDonate = async () => {
    if (!provider || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (project?.nftTokenId === undefined || project?.nftTokenId === null) {
      toast.error('Project NFT not yet minted');
      return;
    }

    setIsDonating(true);
    const loadingToast = toast.loading('Processing donation...');

    try {
      const signer = await provider.getSigner();
      const grantManagerAddress = import.meta.env.VITE_CONTRACT_ADDRESS_GRANT_MANAGER;
      
      if (!grantManagerAddress) {
        toast.error('Grant Manager contract address not configured');
        return;
      }

      // Use proper contract ABI
      const grantManagerABI = ['function donateToProposal(uint256 _nftId) payable'];
      const grantManager = new ethers.Contract(grantManagerAddress, grantManagerABI, signer);

      const tx = await grantManager.donateToProposal(project.nftTokenId, {
        value: ethers.parseEther(donationAmount)
      });

      await tx.wait();
      toast.success(`Successfully donated ${donationAmount} ETH!`, { id: loadingToast });
      
      // Refresh stats after donation
      fetchProjectStats();
    } catch (error: any) {
      console.error('Donation error:', error);
      toast.error(error?.reason || error?.message || 'Failed to donate', { id: loadingToast });
    } finally {
      setIsDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-xl">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-xl">Project not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{project.title}</h1>
            <div className="flex items-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>{project.creator.username || `${project.creator.walletAddress.slice(0, 6)}...${project.creator.walletAddress.slice(-4)}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>{formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          {project.nftTokenId !== undefined && (
            <div className="text-purple-400 font-semibold">NFT #{project.nftTokenId}</div>
          )}
        </div>

        {project.imageUrl && (
          <div className="mb-6 rounded-xl overflow-hidden bg-gray-800">
            <img 
              src={project.imageUrl} 
              alt={project.title}
              className="w-full max-h-96 object-cover"
              onError={(e) => {
                console.error('Image failed to load:', project.imageUrl);
                e.currentTarget.src = 'https://via.placeholder.com/800x400/1f2937/ffffff?text=Image+Not+Found';
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', project.imageUrl);
              }}
            />
          </div>
        )}

        <div className="prose prose-invert max-w-none mb-6">
          <p className="text-gray-300 text-lg leading-relaxed">{project.description}</p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(project.status)}`}>
            {project.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {stats && (project.nftTokenId !== undefined && project.nftTokenId !== null) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="text-purple-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Votes</p>
                  <p className="text-white text-2xl font-bold">{parseFloat(stats.totalVotes).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  <p className="text-gray-500 text-xs">Governance Tokens</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <Coins className="text-pink-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Donations</p>
                  <p className="text-white text-2xl font-bold">{parseFloat(stats.totalDonations).toFixed(4)} ETH</p>
                  <p className="text-gray-500 text-xs">{stats.donorCount} {stats.donorCount === 1 ? 'Donor' : 'Donors'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {project.ipfsCid && (
          <a
            href={`https://ipfs.io/ipfs/${project.ipfsCid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition"
          >
            <ExternalLink size={18} />
            View on IPFS
          </a>
        )}
      </div>

      {project.status === 'active_voting' && user && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">Cast Your Vote</h2>
          <p className="text-gray-400 mb-6">
            Support this project by casting your vote. Your voting power is based on your governance token balance and contribution history.
          </p>
          <div className="flex gap-4 items-end mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Vote Amount (Governance Tokens)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={voteAmount}
                onChange={(e) => setVoteAmount(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
                placeholder="10"
              />
            </div>
          </div>
          <button 
            onClick={handleVote}
            disabled={!account || isVoting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <Vote size={20} />
            {isVoting ? 'Voting...' : 'Vote for Project'}
          </button>
          {!account && (
            <p className="text-yellow-400 text-sm mt-4">
              Please connect your wallet to vote
            </p>
          )}
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-4">Support This Project</h2>
        <p className="text-gray-400 mb-6">
          Make a direct donation to support this creative project.
        </p>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Donation Amount (ETH)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
              placeholder="0.1"
            />
          </div>
          <button 
            onClick={handleDonate}
            disabled={!account || project?.nftTokenId === undefined || project?.nftTokenId === null || isDonating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <Heart size={20} />
            {isDonating ? 'Donating...' : 'Donate'}
          </button>
        </div>
        {!account && (
          <p className="text-yellow-400 text-sm mt-4">
            Please connect your wallet to donate
          </p>
        )}
      </div>
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active_voting':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    case 'successful':
      return 'bg-green-500/20 text-green-400 border-green-500/50';
    case 'failed':
      return 'bg-red-500/20 text-red-400 border-red-500/50';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }
};

export default ProjectDetails;
