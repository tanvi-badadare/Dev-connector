'use client';

import ProfileForm from '../../../components/ProfileForm';
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';

export default function ProfileEditPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth');
        setUser(response.data);
      } catch (err: any) {
        console.error('Failed to fetch user:', err);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dev Connector</h1>
            </div>
            <div className="flex items-center space-x-3">
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
        isOpen={false}
        onToggle={() => {}}
      />

      <ProfileForm />
    </div>
  );
} 