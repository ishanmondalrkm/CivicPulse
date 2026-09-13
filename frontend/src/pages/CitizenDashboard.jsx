import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Landmark,
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Bell,
  User,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Camera,
  Send,
  Sparkles,
  Search,
  Eye,
  Star,
  X,
  Building2,
  MapPin,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CitizenLocationPicker from './CitizenLocationPicker';
import VoiceInput from '../components/VoiceInput';
import ComplaintTimeline from '../components/ComplaintTimeline';

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const { loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('overview'); // overview, new_complaint, my_complaints, notifications, profile
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // Complaint Form State
  const [category, setCategory] = useState(searchParams.get('category') || 'Roads');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [imageAuthenticity, setImageAuthenticity] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [location, setLocation] = useState({
    latitude: 12.9784,
    longitude: 77.6408,
    address: '12th Main Road, Indiranagar',
    ward: 'Ward 12 - Indiranagar'
  });

  // AI Live Assistant
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Selected Complaint for Modal Tracking
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  // Rating Feedback
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const fetchCitizenData = async () => {
    try {
      setLoading(true);
      const [compRes, notifRes] = await Promise.all([
        axios.get(`${API_URL}/api/complaints`, { withCredentials: true }),
        axios.get(`${API_URL}/api/notifications`, { withCredentials: true })
      ]);

      if (compRes.data && compRes.data.complaints) {
        setComplaints(compRes.data.complaints);
      }
      if (notifRes.data && notifRes.data.notifications) {
        setNotifications(notifRes.data.notifications);
        setUnreadNotifs(notifRes.data.unread_count || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCitizenData();
  }, [user, authLoading, navigate]);

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Live camera access is not supported by this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      cameraStreamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(err?.message || 'Could not access the camera. Please allow camera permission.');
    }
  };

  const uploadEvidenceFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    setIsUploadingPhoto(true);
    setImageAuthenticity(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API_URL}/api/uploads/complaint-photo`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPhotoUrl(res.data.photo_url);
      setImageAuthenticity(res.data.image_authenticity || null);
    } catch (err) {
      console.error('Photo upload/AI screening error:', err);
      alert(err.response?.data?.detail || 'The photo could not be uploaded or AI-verified. Please try another image.');
      setPhotoUrl('');
      setImageAuthenticity(null);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleFileSelected = (event) => {
    const file = event.target.files?.[0];
    if (file) uploadEvidenceFile(file);
    event.target.value = '';
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      setCameraError('Camera is not ready yet.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setCameraError('Could not capture the photo.');
        return;
      }
      const file = new File([blob], `civicpulse-camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
      stopCamera();
      await uploadEvidenceFile(file);
    }, 'image/jpeg', 0.92);
  };

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Trigger AI Auto Analysis when description is updated or voice provided
  const handleLiveAIAnalysis = async (textToAnalyze) => {
    const txt = textToAnalyze || description;
    if (!txt || txt.length < 6) return;
    setIsAnalyzing(true);
    try {
      const res = await axios.post(`${API_URL}/api/ai/analyze-complaint`, {
        text: txt,
        category: category
      });
      if (res.data && res.data.analysis) {
        setAiAnalysis(res.data.analysis);
        if (res.data.analysis.category) setCategory(res.data.analysis.category);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVoiceTranscript = (text) => {
    setDescription(text);
    setVoiceTranscript(text);
    handleLiveAIAnalysis(text);
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please provide a complaint description.');
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(null);
    setDuplicateWarning(null);

    try {
      const payload = {
        category,
        title: title || `${category} issue in ${location.ward || 'Area'}`,
        description,
        voice_transcript: voiceTranscript,
        photo_url: photoUrl || null,
        image_authenticity: imageAuthenticity,
        location
      };

      // Check duplicates first
      const dupRes = await axios.post(`${API_URL}/api/ai/duplicate-check`, payload);
      if (dupRes.data && dupRes.data.has_potential_duplicates && !duplicateWarning) {
        setDuplicateWarning(dupRes.data.duplicates);
        setIsSubmitting(false);
        return;
      }

      const res = await axios.post(`${API_URL}/api/complaints`, payload, { withCredentials: true });
      if (res.data && res.data.complaint) {
        setSubmitSuccess(res.data.complaint);
        setDescription('');
        setTitle('');
        setVoiceTranscript('');
        setPhotoUrl('');
        setImageAuthenticity(null);
        setAiAnalysis(null);
        setDuplicateWarning(null);
        fetchCitizenData();
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (complaintNumber) => {
    try {
      await axios.post(
        `${API_URL}/api/complaints/${complaintNumber}/feedback`,
        { rating: feedbackRating, comments: feedbackComment },
        { withCredentials: true }
      );
      setFeedbackSuccess(true);
      fetchCitizenData();
    } catch (err) {
      alert('Failed to submit feedback.');
    }
  };

  // Metric calculations
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'PENDING').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN PROGRESS' || c.status === 'ASSIGNED').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 shrink-0 shadow-sm">
        <div className="space-y-6">
          {/* Portal Logo */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 font-outfit leading-tight">
                Civic<span className="text-blue-600">Pulse</span>
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">Citizen Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" data-testid="citizen-sidebar-nav">
            <button
              onClick={() => setActiveTab('overview')}
              data-testid="sidebar-tab-overview"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </button>

            <button
              onClick={() => setActiveTab('new_complaint')}
              data-testid="sidebar-tab-new-complaint"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'new_complaint'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              + New Complaint
            </button>

            <button
              onClick={() => setActiveTab('my_complaints')}
              data-testid="sidebar-tab-my-complaints"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'my_complaints'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              My Complaints
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              data-testid="sidebar-tab-notifications"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'notifications'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4" />
                Notifications
              </div>
              {unreadNotifs > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadNotifs}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              data-testid="sidebar-tab-profile"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <User className="h-4 w-4" />
              My Profile
            </button>
          </nav>
        </div>

        {/* Bottom Privacy Card & Logout */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Privacy Protected</span>
            </div>
            <p className="text-[11px] text-blue-700/80 leading-relaxed">
              Your personal phone number and PII are shielded from department administrators.
            </p>
          </div>

          <button
            onClick={logout}
            data-testid="citizen-logout-btn"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-base font-bold text-slate-900 font-outfit">Citizen Dashboard</h1>
            <p className="text-xs text-slate-500">Manage and track your civic complaints</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('new_complaint')}
              data-testid="header-new-complaint-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              + New Complaint
            </button>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <span className="text-xs font-bold text-slate-700">{user?.name || 'Citizen'}</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                <User className="h-4 w-4" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 sm:p-8 space-y-8 max-w-7xl">
          {/* Welcome Banner */}
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-outfit">My Dashboard</h2>
            <p className="text-xs text-slate-500 mt-0.5">Welcome back. Here's your complaint overview.</p>
          </div>

          {/* 4 Metric Cards (Matching Screenshot 2) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Total Complaints</span>
              <span className="text-3xl font-extrabold text-slate-900 font-outfit block" data-testid="citizen-stat-total">
                {totalCount}
              </span>
              <span className="text-[11px] text-slate-400 block pt-1">All submitted complaints</span>
            </div>

            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Pending</span>
              <span className="text-3xl font-extrabold text-slate-900 font-outfit block" data-testid="citizen-stat-pending">
                {pendingCount}
              </span>
              <span className="text-[11px] text-amber-600 font-medium block pt-1">Waiting for action</span>
            </div>

            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">In Progress</span>
              <span className="text-3xl font-extrabold text-slate-900 font-outfit block" data-testid="citizen-stat-inprogress">
                {inProgressCount}
              </span>
              <span className="text-[11px] text-blue-600 font-medium block pt-1">Department working</span>
            </div>

            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Resolved</span>
              <span className="text-3xl font-extrabold text-slate-900 font-outfit block" data-testid="citizen-stat-resolved">
                {resolvedCount}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium block pt-1">Successfully resolved</span>
            </div>
          </div>

          {/* Submit New Complaint Card (Matching Screenshot 2) */}
          {(activeTab === 'overview' || activeTab === 'new_complaint') && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-outfit">Submit New Complaint</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tell us what is happening in your area.</p>
              </div>

              {submitSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-bold">Complaint {submitSuccess.complaint_number} registered successfully!</p>
                      <p className="text-[11px]">Routed to {submitSuccess.assigned_department}. You can track progress in real-time.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedComplaint(submitSuccess);
                      setShowTimelineModal(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 shadow-sm"
                  >
                    View Ticket Timeline
                  </button>
                </div>
              )}

              {duplicateWarning && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-800">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>AI Duplicate Detection Notice: Similar issues were recently reported nearby!</span>
                  </div>
                  <div className="space-y-1">
                    {duplicateWarning.map((d, i) => (
                      <p key={i} className="text-[11px] text-amber-700">
                        • <strong>{d.complaint_number}</strong>: {d.title} ({d.location}) - Status: {d.status}
                      </p>
                    ))}
                  </div>
                  <p className="text-[11px]">Would you like to proceed anyway and link your additional evidence?</p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSubmitComplaint}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                    >
                      Yes, Submit My Report
                    </button>
                    <button
                      onClick={() => setDuplicateWarning(null)}
                      className="px-3 py-1 bg-white border border-amber-300 text-amber-800 font-medium rounded-lg text-xs"
                    >
                      Review Details
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitComplaint} className="space-y-6">
                {/* Category & Priority Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      data-testid="complaint-category-select"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Roads">Roads</option>
                      <option value="Water Supply">Water Supply</option>
                      <option value="Sanitation">Sanitation</option>
                      <option value="Streetlights">Streetlights</option>
                      <option value="Drainage">Drainage</option>
                      <option value="Garbage">Garbage</option>
                      <option value="Public Infrastructure">Public Infrastructure</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-800">AI Priority — Citizen cannot choose</span>
                    </div>
                    <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
                      Priority is calculated automatically from safety severity, nearby critical infrastructure, and the number of active complaints around this location.
                    </p>
                  </div>
                </div>

                {/* Multilingual Voice Input Integration */}
                <VoiceInput onTranscript={handleVoiceTranscript} />

                {/* Description Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Complaint Description</label>
                    <button
                      type="button"
                      onClick={() => handleLiveAIAnalysis()}
                      disabled={isAnalyzing}
                      data-testid="ai-assist-analyze-btn"
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      {isAnalyzing ? 'AI Analyzing...' : 'AI Auto-Detect'}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => handleLiveAIAnalysis()}
                    placeholder="Describe the issue in English, Hindi, Bengali, Tamil, etc..."
                    data-testid="complaint-description-textarea"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* AI Classification Live Preview */}
                {aiAnalysis && (
                  <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600" /> AI Classification Live Result
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                        Lang: {aiAnalysis.detected_language}
                      </span>
                    </div>
                    <p className="text-slate-700">
                      <strong>Auto-Routed Department:</strong> {aiAnalysis.recommended_department}
                    </p>
                    {aiAnalysis.translated_text && aiAnalysis.detected_language !== 'English' && (
                      <p className="text-slate-600 italic">
                        <strong>English Normalized:</strong> "{aiAnalysis.translated_text}"
                      </p>
                    )}
                  </div>
                )}

                {/* Map & Photo Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                  {/* Location Picker */}
                  <CitizenLocationPicker location={location} onChange={setLocation} />

                  {/* Photo Evidence */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-800">Photo Evidence</span>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={startCamera}
                          disabled={isUploadingPhoto}
                          data-testid="open-live-camera-btn"
                          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Camera className="h-4 w-4" />
                          Open Live Camera
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingPhoto}
                          data-testid="upload-photo-btn"
                          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 disabled:opacity-50"
                        >
                          <Camera className="h-4 w-4" />
                          Upload a Photo
                        </button>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        capture="environment"
                        data-testid="photo-evidence-file-input"
                        onChange={handleFileSelected}
                        className="hidden"
                      />

                      {isUploadingPhoto && (
                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800 font-semibold">
                          Uploading photo and running AI authenticity screening…
                        </div>
                      )}

                      {cameraError && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                          {cameraError}
                        </div>
                      )}

                      {cameraOpen && (
                        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                          <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">Live Camera</h4>
                                <p className="text-[11px] text-slate-500">Point the camera at the civic issue and capture a clear photo.</p>
                              </div>
                              <button type="button" onClick={stopCamera} className="p-2 rounded-full hover:bg-slate-100">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="bg-black aspect-video">
                              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
                            </div>
                            <div className="p-4 flex justify-center gap-2">
                              <button type="button" onClick={stopCamera} className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700">Cancel</button>
                              <button type="button" onClick={capturePhoto} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">
                                <Camera className="h-4 w-4" /> Capture & Verify
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {photoUrl ? (
                        <div className="space-y-2">
                          <div className="relative rounded-lg overflow-hidden h-40 bg-slate-200 border border-slate-300">
                            <img src={photoUrl} alt="Complaint evidence" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => { setPhotoUrl(''); setImageAuthenticity(null); }}
                              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>

                          {imageAuthenticity && (
                            <div className={`rounded-lg border p-3 text-[11px] ${
                              imageAuthenticity.label === 'LIKELY_REAL'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : imageAuthenticity.label === 'LIKELY_AI_GENERATED'
                                ? 'border-red-200 bg-red-50 text-red-800'
                                : 'border-amber-200 bg-amber-50 text-amber-800'
                            }`}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold">AI Authenticity Screen: {imageAuthenticity.label.replaceAll('_', ' ')}</span>
                                <span>{Math.round((imageAuthenticity.confidence || 0) * 100)}% confidence</span>
                              </div>
                              <p className="mt-1">{imageAuthenticity.reason}</p>
                              <p className="mt-1 opacity-75">This is an AI screening signal, not forensic proof.</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-slate-400 text-xs">
                          No photo selected. You can take a live camera photo or upload JPEG/PNG/WebP evidence.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Form Submit Button */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="submit-complaint-btn"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.01]"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Registering with AI Pipeline...' : 'Submit Grievance'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* My Complaints Table (Matching Screenshot 2) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-outfit">My Complaints</h3>
                <p className="text-xs text-slate-500">Live list of your filed grievances and resolutions</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700" data-testid="my-complaints-table">
                <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Complaint ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400">
                        No complaints filed yet. Use the form above to register an issue.
                      </td>
                    </tr>
                  ) : (
                    complaints.map((c) => (
                      <tr key={c.complaint_number} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {c.complaint_number}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {c.category}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {c.location?.ward || 'Ward 12'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              c.priority === 'High' || c.priority === 'Critical'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {c.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              c.status === 'RESOLVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'IN PROGRESS'
                                ? 'bg-blue-100 text-blue-800'
                                : c.status === 'ASSIGNED'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedComplaint(c);
                              setShowTimelineModal(true);
                              setFeedbackSuccess(false);
                            }}
                            data-testid={`track-btn-${c.complaint_number}`}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Track & View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notifications Tab View */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 font-outfit">In-App Notifications</h3>
                <button
                  onClick={async () => {
                    await axios.post(`${API_URL}/api/notifications/mark-all-read`, {}, { withCredentials: true });
                    fetchCitizenData();
                  }}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Mark all as read
                </button>
              </div>
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      n.read ? 'bg-slate-50 border-slate-200' : 'bg-blue-50/70 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{n.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 max-w-xl">
              <h3 className="text-base font-bold text-slate-900 font-outfit">Citizen Profile</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block font-medium">Registered Name</span>
                  <span className="text-slate-800 font-bold text-sm">{user?.name}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block font-medium">Mobile Number</span>
                  <span className="text-slate-800 font-mono font-bold">{user?.mobile}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block font-medium">Municipal Ward</span>
                  <span className="text-slate-800 font-bold">{user?.ward || 'Ward 12 - Indiranagar'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block font-medium">Privacy Status</span>
                  <span className="text-emerald-700 font-bold">Encrypted & Shielded from Department View</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Complaint Timeline Modal */}
      {showTimelineModal && selectedComplaint && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          data-testid="citizen-timeline-modal-backdrop"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 font-outfit">
                  Grievance Progress & Resolution Timeline
                </h3>
              </div>
              <button
                onClick={() => setShowTimelineModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ComplaintTimeline complaint={selectedComplaint} />

            {/* Citizen Feedback Component if Resolved */}
            {selectedComplaint.status === 'RESOLVED' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-emerald-600" /> Rate Resolution Quality
                </h4>
                {feedbackSuccess ? (
                  <p className="text-xs text-emerald-700 font-semibold">
                    Thank you! Your feedback has been recorded for the department's SLA rating.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className={`p-1 text-lg ${
                            star <= feedbackRating ? 'text-amber-500' : 'text-slate-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Optional feedback comment on the repair..."
                      className="w-full text-xs bg-white border border-emerald-200 rounded-lg p-2 text-slate-800"
                    />
                    <button
                      onClick={() => handleFeedbackSubmit(selectedComplaint.complaint_number)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                    >
                      Submit Feedback
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}