import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Plus, FileText, Award } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Project {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: string;
  createdAt: string;
  nftTokenId?: number;
}

const Dashboard = () => {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributionStats, setContributionStats] = useState({
    contributions: 0,
    credentials: 0
  });

  useEffect(() => {
    if (user && token) {
      fetchUserProjects();
      fetchContributionStats();
    }
  }, [user, token]);

  const fetchContributionStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/contributions/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const contributions = response.data;
      const withCredentials = contributions.filter((c: any) => c.credentialCid).length;
      
      setContributionStats({
        contributions: contributions.length,
        credentials: withCredentials
      });
    } catch (error) {
      console.error('Error fetching contributions:', error);
    }
  };

  const fetchUserProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Filter to show only projects created by the current user
      const userProjects = response.data.filter((p: any) => {
        if (!p.creator) return false;
        const creatorId = typeof p.creator === 'object' ? p.creator._id : p.creator;
        return creatorId === user?.id;
      });
      setProjects(userProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h2 className="text-3xl font-bold text-white mb-4">Authentication Required</h2>
        <p className="text-gray-400">Please connect your wallet and sign in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">My Dashboard</h1>
          <p className="text-gray-400">Manage your projects and contributions</p>
        </div>
        <Link
          to="/create"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
        >
          <Plus size={20} />
          New Project
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <StatCard icon={<FileText />} value={projects.length.toString()} label="My Projects" />
        <StatCard icon={<Award />} value={contributionStats.contributions.toString()} label="Contributions" />
        <StatCard icon={<Award />} value={contributionStats.credentials.toString()} label="Credentials Earned" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">My Projects</h2>
        {loading ? (
          <div className="text-gray-400">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
            <p className="text-gray-400 mb-4">You haven't created any projects yet</p>
            <Link
              to="/create"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                  {project.nftTokenId !== undefined && (
                    <span className="text-purple-400 text-xs">#{project.nftTokenId}</span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                <p className="text-gray-400 line-clamp-2">{project.description}</p>
              </Link>
            ))}
          </div>
        )}
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

export default Dashboard;
