// src/pages/LandingPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Shield,
  Bell,
  FileText,
  Users,
  Camera,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Lock,
  Cloud,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Eye,
  Fingerprint,
  Video,
  AlertTriangle,
  TrendingUp,
  Award,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react';

// Navbar Component
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'HOME', href: '#home' },
    { name: 'ABOUT', href: '#about' },
    { name: 'FEATURES', href: '#features' },
    { name: 'CONTACT', href: '#contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <img src="/images/logo.png" alt="SmartFIR Logo" className="w-10 h-10 group-hover:scale-105 transition-transform" />
            <span className="text-xl font-bold tracking-tight text-gray-900">SMARTFIR</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium tracking-wide text-gray-700 hover:text-[#636d79] transition-colors uppercase"
              >
                {link.name}
              </a>
            ))}
            <Link
              to="/login"
              className="bg-[#636d79] hover:bg-[#4a525c] text-white px-6 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg"
            >
              LOGIN TO DASHBOARD
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white rounded-2xl shadow-lg mt-4 p-4"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 hover:text-[#636d79] py-2 transition uppercase text-sm"
                >
                  {link.name}
                </a>
              ))}
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="bg-[#636d79] text-white text-center px-4 py-2 rounded-full text-sm font-medium"
              >
                LOGIN TO DASHBOARD
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

// Hero Section - Inspired by Deviatek
const Hero = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        >
          <source src="/videos/e3bfe5a27d6d8868bf32b1ced6cc6a80.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-[#636d79]/20"></div>
        
        {/* Video Control Button */}
        <button
          onClick={toggleVideo}
          className="absolute bottom-8 right-8 z-20 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all border border-white/30"
        >
          {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
        </button>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
              SMARTFIR
              <span className="block text-[#636d79] text-5xl md:text-6xl mt-2">Elevate Security.</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
              Get Your Security Fit: Where Advanced Technology Meets 
              Law Enforcement Excellence with SmartFIR.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="bg-[#636d79] hover:bg-[#4a525c] text-white px-8 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                ACCESS DASHBOARD
                <ArrowRight size={18} />
              </Link>
              <a
                href="#features"
                className="border-2 border-gray-300 hover:border-[#636d79] text-gray-700 hover:text-[#636d79] px-8 py-3 rounded-full font-medium transition-all"
              >
                EXPLORE FEATURES
              </a>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-2 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

// About Us Section
const AboutUs = () => {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Sound in its <br />
              <span className="text-[#636d79]">purest state.</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              SmartFIR is an advanced police management system renowned for delivering unmatched security 
              solutions through innovative features like real-time suspect detection. Founded in 2020, 
              SmartFIR delivers advanced technology and elegant design to create an exceptional law enforcement experience.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              SmartFIR is renowned for its comprehensive features and intuitive interface, earning awards 
              for the unique fusion of superior security technology and appealing design. As a leader in 
              the law enforcement technology industry, the brand continues to combine top-tier security 
              solutions with beautiful design.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-[#636d79]/10 rounded-2xl blur-2xl"></div>
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-[400px] object-cover"
                poster="https://images.unsplash.com/photo-1582131509220-2a7c6f9e8c1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              >
                <source src="/videos/ffb0ff6d3a5475590967416cd44649e7.mp4" type="video/mp4" />
              </video>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <p className="text-white text-sm">Advanced Security Solutions Since 2020</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Features Collection Section - Inspired by Portfolio Layout
const FeaturesCollection = () => {
  const features = [
    {
      number: "01",
      title: "Real-time Alerts",
      description: "Instant suspect detection with AI-powered confidence scores",
      icon: <Bell className="w-8 h-8" />,
      color: "#636d79"
    },
    {
      number: "02",
      title: "AI Surveillance",
      description: "Advanced facial recognition through integrated CCTV",
      icon: <Camera className="w-8 h-8" />,
      color: "#636d79"
    },
    {
      number: "03",
      title: "Digital FIR",
      description: "Streamlined FIR filing with digital signatures",
      icon: <FileText className="w-8 h-8" />,
      color: "#636d79"
    },
    {
      number: "04",
      title: "Officer Management",
      description: "Efficiently manage officers and track performance",
      icon: <Users className="w-8 h-8" />,
      color: "#636d79"
    },
    {
      number: "05",
      title: "Advanced Analytics",
      description: "Comprehensive crime pattern analysis",
      icon: <BarChart3 className="w-8 h-8" />,
      color: "#636d79"
    }
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            SMARTFIR <span className="text-[#636d79]">COLLECTION</span>
          </h2>
        </div>

        <div className="space-y-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group border-b border-gray-200 pb-8 last:border-0"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="text-5xl font-bold text-[#636d79]/20 group-hover:text-[#636d79]/40 transition-colors">
                    {feature.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-[#636d79]">
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 max-w-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <div className="md:text-right">
                  <a 
                    href="#" 
                    className="inline-flex items-center gap-2 text-[#636d79] hover:text-[#4a525c] transition-colors font-medium"
                  >
                    Learn More
                    <ChevronRight size={18} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Services Section - Grid Layout
const Services = () => {
  const services = [
    {
      title: "UX & UI",
      description: "Designing interfaces that are intuitive, efficient, and enjoyable to use.",
      icon: <Shield className="w-10 h-10" />
    },
    {
      title: "Web & Mobile App",
      description: "Transforming ideas into exceptional web and mobile app experiences.",
      icon: <Camera className="w-10 h-10" />
    },
    {
      title: "Security Solutions",
      description: "Cutting-edge security designs that protect your community.",
      icon: <Lock className="w-10 h-10" />
    },
    {
      title: "Development",
      description: "Bringing your vision to life with the latest technology and trends.",
      icon: <BarChart3 className="w-10 h-10" />
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Collaborate with agencies to <br />
            <span className="text-[#636d79]">create impactful results.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="mb-4 text-[#636d79] group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Partners Section
const Partners = () => {
  const partners = [
    "PUNJAB POLICE",
    "INTERPOL",
    "FIA",
    "NADRA",
    "CITY MONITORING"
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-center gap-12">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-gray-500 font-semibold text-lg tracking-wide hover:text-[#636d79] transition-colors cursor-pointer"
            >
              {partner}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTA = () => {
  return (
    <section className="py-24 bg-[#636d79]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Tell me about your next project
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="mailto:support@smartfir.gov.pk"
            className="bg-white text-[#636d79] hover:bg-gray-100 px-8 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Mail size={18} />
            Email Me
          </a>
          <a
            href="#"
            className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-full font-medium transition-all flex items-center gap-2"
          >
            <Phone size={18} />
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition">
              LinkedIn
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              Dribbble
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              Instagram
            </a>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Building digital products, brands, and experience.
            </p>
          </div>
          <div>
            <Link to="/login" className="text-gray-400 hover:text-white transition text-sm">
              Learn More →
            </Link>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2024 SmartFIR. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <AboutUs />
      <FeaturesCollection />
      <Services />
      <Partners />
      <CTA />
      <Footer />
    </div>
  );
}

export default LandingPage;