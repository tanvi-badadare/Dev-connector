'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../services/api';
import EnhancedProfileDisplay from '../../../components/EnhancedProfileDisplay';
import Sidebar from '../../../components/Sidebar';

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
  website?: string;
  githubusername?: string;
  social?: {
    youtube?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
}

interface Post {
  _id: string;
  text: string;
  name: string;
  avatar: string;
  user: string;
  likes: Array<{ user: string }>;
  comments: Array<{
    _id: string;
    text: string;
    name: string;
    user: string;
    date: string;
  }>;
  date: string;
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await api.get(`/profile/user/${userId}`);
        setProfile(profileResponse.data);

        // Fetch user's posts
        const postsResponse = await api.get('/posts');
        const allPosts = postsResponse.data;
        const userPosts = allPosts.filter((post: Post) => post.user === userId);
        setPosts(userPosts);
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          router.push('/login');
        } else {
          setError('Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/auth');
        setUser(response.data);
      } catch (err: any) {
        console.error('Failed to fetch current user:', err);
      }
    };

    fetchUserData();
    fetchCurrentUser();
  }, [userId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-xl">{error || 'Profile not found'}</div>
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

      <EnhancedProfileDisplay profile={profile} isOwnProfile={false} />
      
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

      {/* Posts Section */}
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{profile.user.name}'s Posts</h3>
          
          {posts.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 text-lg">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={post.avatar}
                      alt={post.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{post.name}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(post.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-800 mb-4">{post.text}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{post.likes.length} likes</span>
                    <span>{post.comments.length} comments</span>
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