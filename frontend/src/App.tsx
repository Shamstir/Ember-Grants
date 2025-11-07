import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';
import Dashboard from './pages/Dashboard';
import Governance from './pages/Governance';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/create" element={<CreateProject />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/governance" element={<Governance />} />
      </Routes>
    </Layout>
  );
}

export default App;
