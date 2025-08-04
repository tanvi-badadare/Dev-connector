'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';

interface Profile {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  status: string;
  company?: string;
  location?: string;
  skills: string[];
  bio?: string;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfiles = async () => {
      try {
        const response = await api.get('/profile');
        setProfiles(response.data);
        setFilteredProfiles(response.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          router.push('/login');
        } else {
          setError('Failed to load profiles');
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

    fetchProfiles();
    fetchUser();
  }, [router]);

  // Filter profiles based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProfiles(profiles);
    } else {
      const filtered = profiles.filter(profile => {
        const searchLower = searchTerm.toLowerCase();
        return (
          profile.user.name.toLowerCase().includes(searchLower) ||
          profile.status.toLowerCase().includes(searchLower) ||
          (profile.company && profile.company.toLowerCase().includes(searchLower)) ||
          (profile.location && profile.location.toLowerCase().includes(searchLower)) ||
          (profile.skills && profile.skills.some(skill => 
            skill.toLowerCase().includes(searchLower)
          ))
        );
      });
      setFilteredProfiles(filtered);
    }
  }, [searchTerm, profiles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading profiles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
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
          router.push('/');
        }}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Developer Profiles</h2>
            <p className="text-gray-600">Browse and connect with other developers</p>
            
            {/* Search Bar */}
            <div className="mt-6 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, skills, company, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              {searchTerm && (
                <p className="mt-2 text-sm text-gray-600">
                  Found {filteredProfiles.length} developer{filteredProfiles.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No developers found matching your search' : 'No profiles found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <div key={profile._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <img
                        src={profile.user.avatar}
                        alt={profile.user.name}
                        className="w-16 h-16 rounded-full mr-4"
                      />
                                          <div>
                      <a 
                        href={`/profile/${profile.user._id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {profile.user.name}
                      </a>
                      <p className="text-gray-600">{profile.status}</p>
                    </div>
                    </div>

                    {profile.company && (
                      <div className="mb-3">
                        <span className="text-gray-600">Company: </span>
                        <span className="text-gray-900">{profile.company}</span>
                      </div>
                    )}

                    {profile.location && (
                      <div className="mb-3">
                        <span className="text-gray-600">Location: </span>
                        <span className="text-gray-900">{profile.location}</span>
                      </div>
                    )}

                    {profile.bio && (
                      <div className="mb-4">
                        <p className="text-gray-700">{profile.bio}</p>
                      </div>
                    )}

                    {profile.skills && profile.skills.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 