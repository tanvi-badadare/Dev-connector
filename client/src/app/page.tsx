'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';

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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts');
        setPosts(response.data);
      } catch (err: any) {
        // If unauthorized, just show empty state instead of error
        if (err.response?.status === 401) {
          setPosts([]);
        } else {
          setError('Failed to load posts');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Dev Connector</h1>
            <p className="text-gray-600 text-lg mb-8">Welcome to the developer community!</p>
            <div className="flex justify-center space-x-4">
              <a
                href="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dev Connector</h1>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Posts Feed */}
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Community Posts</h2>
          <p className="text-gray-600">See what developers are sharing</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts yet. Be the first to share something!</p>
            <div className="mt-4">
              <a
                href="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Sign In to Post
              </a>
            </div>
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
                    <h3 className="font-semibold text-gray-900">{post.name}</h3>
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
  );
}
