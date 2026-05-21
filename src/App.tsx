import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ParticleBackground } from './components/ParticleBackground';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';

// Pages
import Home from './pages/Home';
import Research from './pages/Research';
import Startup from './pages/Startup';
import Teaching from './pages/Teaching';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <div className="min-h-screen relative selection:bg-academic-brand/20 selection:text-academic-brand">
        <SEO />
        <ParticleBackground />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Home />} />
          <Route path="/research" element={<Research />} />
          <Route path="/startup" element={<Startup />} />
          <Route path="/teaching" element={<Teaching />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
