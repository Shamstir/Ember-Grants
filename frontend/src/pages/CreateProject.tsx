import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CreateProject = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !token) {
      toast.error('Please authenticate first');
      return;
    }

    if (!formData.title || !formData.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/projects`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('Project created successfully!');
      navigate(`/projects/${response.data.project._id}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h2 className="text-3xl font-bold text-white mb-4">Authentication Required</h2>
        <p className="text-gray-400">Please connect your wallet and sign in to create a project.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Create New Project</h1>
        <p className="text-gray-400">Submit your creative project for community funding</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 space-y-6">
        <div>
          <label htmlFor="title" className="block text-white font-semibold mb-2">
            Project Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            placeholder="Enter your project title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-white font-semibold mb-2">
            Project Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={8}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"
            placeholder="Describe your project, goals, and how you plan to use the funding..."
            required
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-white font-semibold mb-2">
            Project Image URL (Optional)
          </label>
          <input
            type="url"
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            placeholder="https://example.com/image.jpg or ipfs://..."
          />
          <p className="text-gray-500 text-xs mt-1">
            Upload your image to Imgur, IPFS, or any public URL
          </p>
          {formData.imageUrl && (
            <div className="mt-3">
              <p className="text-gray-400 text-sm mb-2">Preview:</p>
              <img 
                src={formData.imageUrl} 
                alt="Project preview" 
                className="w-full h-48 object-cover rounded-lg border border-white/10"
                onError={(e) => {
                  e.currentTarget.src = '';
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Next Steps</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Your project will be minted as an NFT</li>
            <li>• Community members will vote during the voting period</li>
            <li>• Successful projects receive micro-grant funding</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={20} />
              Creating Project...
            </>
          ) : (
            <>
              <Upload size={20} />
              Submit Project
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateProject;
