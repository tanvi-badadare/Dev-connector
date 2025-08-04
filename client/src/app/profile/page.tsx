'use client';

import ProfileForm from '../../components/ProfileForm';
import EnhancedProfileDisplay from '../../components/EnhancedProfileDisplay';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile/me');
        setProfile(response.data);
      } catch (err: any) {
        if (err.response?.status === 400) {
          setShowForm(true);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await api.get('/auth');
        setUser(response.data);
      } catch (err: any) {
        console.error('Failed to fetch user:', err);
      }
    };

    fetchProfile();
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (showForm) {
    return <ProfileForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="w-full px-0">
          <div className="flex justify-between h-16 px-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="bg-black text-white p-2 rounded-md hover:bg-gray-800 transition-colors -ml-12"
              >
                {sidebarOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Dev Connector</h1>
            </div>
            <div className="flex items-center">
              <a href="/profiles" className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
                Find Developers
              </a>
            </div>
          </div>
        </div>
      </nav>

      <Sidebar 
        user={user} 
        onLogout={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          window.location.href = '/';
        }}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <EnhancedProfileDisplay profile={profile} isOwnProfile={true} />
    </div>
  );
} 