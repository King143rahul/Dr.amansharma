import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ParticleBackground } from './components/ParticleBackground';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';

// Pages
import Home from './pages/Home';
import Research from './pages/Research';
import Startup from './pages/Startup';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Invitation from './pages/Invitation';
import AdminDashboard from './pages/AdminDashboard';
import Team from './pages/Team';

const PublicLayout = () => {
  return (
    <>
      <SEO />
      <ParticleBackground />
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen relative selection:bg-academic-brand/20 selection:text-academic-brand">
        <Routes>
          {/* Public Routes with Navbar and Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/research" element={<Research />} />
            <Route path="/startup" element={<Startup />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/team" element={<Team />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Home />} />
          </Route>

          {/* Secure Admin Routes without the main Navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/invite" element={<Invitation />} />
          <Route path="/auth/callback" element={<Invitation />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
