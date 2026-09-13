import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Landmark,
  Search,
  Sparkles,
  PlusCircle,
  Activity,
  ChevronRight,
  Building2,
  Hammer,
  Droplets,
  Trash2,
  Lightbulb,
  Waves,
  Mic,
  CheckCircle2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import ComplaintTimeline from '../components/ComplaintTimeline';

export default function LandingPage() {
  const { login, API_URL } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_complaints: 1248,
    resolved: 708,
    pending: 326,
    in_progress: 214,
    resolution_rate: '56.7%',
    high_priority: 42
  });

  const [trackId, setTrackId] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/public/stats`)
      .then((res) => {
        if (res.data) setStats(res.data);
      })
      .catch(() => {});
  }, [API_URL]);

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    setIsSearching(true);
    setTrackError('');
    setTrackedComplaint(null);
    try {
      const res = await axios.get(`${API_URL}/api/complaints/${trackId.trim()}`, { withCredentials: true });
      if (res.data && res.data.complaint) {
        setTrackedComplaint(res.data.complaint);
      }
    } catch (err) {
      setTrackError('Complaint not found or authentication required for detailed privacy access. Please sign in as Citizen or Admin.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickLogin = async (role) => {
    if (role === 'citizen') {
      const res = await login('9876543210', 'citizen123');
      if (res.success) navigate('/citizen');
    } else if (role === 'admin') {
      const res = await login('admin@civicpulse.org', 'admin123');
      if (res.success) navigate('/admin');
    } else if (role === 'dev') {
      const res = await login('dev@civicpulse.org', 'dev123');
      if (res.success) navigate('/admin');
    }
  };

  const categories = [
    { name: 'Roads & Potholes', icon: Hammer, color: 'bg-amber-500', count: '412 reports' },
    { name: 'Water Supply', icon: Droplets, color: 'bg-blue-500', count: '298 reports' },
    { name: 'Garbage & Waste', icon: Trash2, color: 'bg-emerald-500', count: '315 reports' },
    { name: 'Streetlights', icon: Lightbulb, color: 'bg-yellow-500', count: '142 reports' },
    { name: 'Drainage & Floods', icon: Waves, color: 'bg-indigo-500', count: '89 reports' },
    { name: 'Public Infrastructure', icon: Building2, color: 'bg-violet-500', count: '54 reports' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      <Navbar />
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-slate-900 text-white py-20 lg:py-28">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-blue-300" />
                <span>AI-Powered Citizen Grievance & Resolution Platform</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-outfit leading-tight">
                Report. Track. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-200 to-white">
                  See it Resolved.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed font-normal">
                Report civic issues in your city in your own language via voice, text, or photo evidence. CivicPulse AI understands, categorizes, and dispatches directly to the right municipal department.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/citizen"
                  data-testid="hero-new-complaint-cta"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <PlusCircle className="h-4 w-4 text-blue-600" />
                  + New Complaint
                </Link>
                <a
                  href="#track-section"
                  data-testid="hero-track-cta"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl backdrop-blur-sm transition-all"
                >
                  <Search className="h-4 w-4 text-cyan-300" />
                  Track Grievance
                </a>
              </div>
              <div className="pt-6 border-t border-blue-700/50">
                <span className="text-xs font-semibold text-blue-200 block mb-2.5">
                  
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                 
                  <button
                    onClick={() => handleQuickLogin('dev')}
                    data-testid="demo-login-dev-btn"
                    className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 shadow-sm transition-all"
                  >
                    System Logs (Developer)
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl text-white space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm font-bold tracking-wide">City Grievance Live Pulse</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                    LIVE SYNC
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-xs text-slate-300 block">Total Reported</span>
                    <span className="text-2xl font-extrabold text-white font-outfit" data-testid="hero-stat-total">
                      {stats.total_complaints.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-300 block mt-0.5">+12.4% this month</span>
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-xs text-slate-300 block">Resolved Cases</span>
                    <span className="text-2xl font-extrabold text-emerald-400 font-outfit" data-testid="hero-stat-resolved">
                      {stats.resolved.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-300 block mt-0.5">{stats.resolution_rate} rate</span>
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-xs text-slate-300 block">In Progress</span>
                    <span className="text-2xl font-extrabold text-blue-300 font-outfit">
                      {stats.in_progress.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-300 block mt-0.5">Departments working</span>
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-xs text-slate-300 block">High Priority</span>
                    <span className="text-2xl font-extrabold text-red-400 font-outfit">
                      {stats.high_priority.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-red-300 block mt-0.5">Rapid SLA active</span>
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-cyan-300">CP-1092 • Roads</span>
                    <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                      HIGH PRIORITY
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 line-clamp-1">
                    Major road damage & crater repair near Indiranagar 12th Main
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                    <span>Status: IN PROGRESS</span>
                    <span className="text-emerald-300 font-semibold">PWD Dispatched</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="stats" className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <span className="text-3xl font-extrabold text-blue-600 font-outfit block">1,248</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Complaints</span>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-amber-500 font-outfit block">326</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Attention</span>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-blue-500 font-outfit block">214</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</span>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-emerald-600 font-outfit block">708</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved Issues</span>
            </div>
          </div>
        </div>
      </section>
      <section id="categories" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 font-outfit">
            Grievance Categories
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Select an issue category to file an immediate complaint with location and multimedia evidence.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={idx}
                to={`/citizen?category=${encodeURIComponent(cat.name.split(' ')[0])}`}
                data-testid={`category-card-${idx}`}
                className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group flex items-start justify-between"
              >
                <div className="space-y-2">
                  <div className={`w-11 h-11 rounded-xl ${cat.color} text-white flex items-center justify-center shadow-md`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors pt-1">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-slate-400 block">{cat.count}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <section id="how-it-works" className="py-16 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">End-to-End Workflow</span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-outfit mt-1">
              How CivicPulse Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              From instant citizen voice/text reporting to AI classification, automated department routing, and live timeline tracking.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {[
              { step: '01', title: '1. Report', desc: 'Submit text, voice in Indian languages, photo & GPS map pin.', icon: Mic },
              { step: '02', title: '2. AI Understands', desc: 'Auto-translates, detects priority, category, & duplicate check.', icon: Sparkles },
              { step: '03', title: '3. Dept Routing', desc: 'Auto-assigns to Roads, Water Board, BESCOM, or Sanitation.', icon: Building2 },
              { step: '04', title: '4. Action & Fix', desc: 'Municipal engineers dispatched with field timeline updates.', icon: Hammer },
              { step: '05', title: '5. Track & Resolve', desc: 'Citizen receives SMS/in-app alert and rates resolution quality.', icon: CheckCircle2 }
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <div key={i} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      STEP {st.step}
                    </span>
                    <Icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{st.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section id="track-section" className="py-16 max-w-4xl mx-auto px-4 sm:px-6 w-full">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-outfit">
              Track Your Civic Complaint
            </h3>
            <p className="text-xs text-slate-500">
              Enter your Complaint Reference Number (e.g., CP-1092 or CP-1087) to view real-time department progress.
            </p>
          </div>
          <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="text"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              placeholder="Enter Complaint ID (e.g. CP-1092)"
              data-testid="track-input-landing"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              data-testid="track-submit-btn-landing"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isSearching ? 'Searching...' : 'Track Status'}
            </button>
          </form>
          {trackError && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs max-w-xl mx-auto">
              <p className="font-semibold">{trackError}</p>
              <div className="mt-2 flex gap-2">
               
              </div>
            </div>
          )}
          {trackedComplaint && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <ComplaintTimeline complaint={trackedComplaint} />
            </div>
          )}
        </div>
      </section>
      <footer className="mt-auto bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Landmark className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold font-outfit">
              Civic<span className="text-blue-400">Pulse</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Smart India Hackathon (SIH) Prototype • AI-assisted Citizen Complaint & Resolution System
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link to="/login" className="hover:text-white transition-colors">
              Portal Login
            </Link>
            <span>•</span>
            <span className="text-slate-500">Privacy Restricted</span>
          </div>
        </div>
      </footer>
    </div>
  );
}