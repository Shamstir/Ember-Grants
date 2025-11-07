import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      console.log('Fetched projects:', response.data);
      console.log('First project imageUrl:', response.data[0]?.imageUrl);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-xl">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">All Projects</h1>
          <p className="text-gray-400">Discover and support creative projects</p>
        </div>
        
        <div className="flex gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="All" />
          <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')} label="Pending" />
          <FilterButton active={filter === 'active_voting'} onClick={() => setFilter('active_voting')} label="Voting" />
          <FilterButton active={filter === 'successful'} onClick={() => setFilter('successful')} label="Funded" />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No projects found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition group"
            >
              {project.imageUrl && (
                <div className="w-full h-48 bg-gray-800 flex items-center justify-center overflow-hidden">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title}
                    className="w-full h-full object-cover"
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
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                  {project.nftTokenId !== undefined && (
                    <span className="text-purple-400 text-xs">#{project.nftTokenId}</span>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition">
                  {project.title}
                </h3>
              
              <p className="text-gray-400 mb-4 line-clamp-3">
                {project.description}
              </p>
              
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{project.creator.username || `${project.creator.walletAddress.slice(0, 6)}...`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterButton = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium transition ${
      active
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
        : 'bg-white/5 text-gray-400 hover:bg-white/10'
    }`}
  >
    {label}
  </button>
);

export default Projects;
