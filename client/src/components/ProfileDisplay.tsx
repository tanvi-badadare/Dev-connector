'use client';

import { useState, useEffect } from 'react';
import api from '../services/api';

interface Profile {
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  company: string;
  website: string;
  location: string;
  status: string;
  skills: string[];
  bio: string;
  githubusername: string;
  social: {
    youtube: string;
    twitter: string;
    facebook: string;
    linkedin: string;
    instagram: string;
  };
}

export default function ProfileDisplay({ userId }: { userId?: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const endpoint = userId ? `/profile/user/${userId}` : '/profile/me';
        const response = await api.get(endpoint);
        setProfile(response.data);
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
            <div className="flex items-center">
              <img
                src={profile.user.avatar}
                alt={profile.user.name}
                className="w-20 h-20 rounded-full border-4 border-white"
              />
              <div className="ml-6 text-white">
                <h1 className="text-3xl font-bold">{profile.user.name}</h1>
                <p className="text-xl opacity-90">{profile.status}</p>
                {profile.location && (
                  <p className="opacity-75">{profile.location}</p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2">
                {/* Bio */}
                {profile.bio && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div>
                {/* Company & Website */}
                {(profile.company || profile.website) && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Info</h3>
                    {profile.company && (
                      <div className="mb-2">
                        <span className="font-medium text-gray-700">Company:</span>
                        <span className="ml-2 text-gray-600">{profile.company}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div>
                        <span className="font-medium text-gray-700">Website:</span>
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Social Links */}
                {profile.social && Object.values(profile.social).some(link => link) && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
                    <div className="space-y-2">
                      {profile.social.youtube && (
                        <a
                          href={profile.social.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-red-600 hover:text-red-800"
                        >
                          <span className="mr-2">🎥</span> YouTube
                        </a>
                      )}
                      {profile.social.twitter && (
                        <a
                          href={profile.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-400 hover:text-blue-600"
                        >
                          <span className="mr-2">🐦</span> Twitter
                        </a>
                      )}
                      {profile.social.facebook && (
                        <a
                          href={profile.social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <span className="mr-2">📘</span> Facebook
                        </a>
                      )}
                      {profile.social.linkedin && (
                        <a
                          href={profile.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-700 hover:text-blue-900"
                        >
                          <span className="mr-2">💼</span> LinkedIn
                        </a>
                      )}
                      {profile.social.instagram && (
                        <a
                          href={profile.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-pink-600 hover:text-pink-800"
                        >
                          <span className="mr-2">📷</span> Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 