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
  const [commentText, setCommentText] = useState('');
  const [commentingPost, setCommentingPost] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
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

  const handleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const currentUserId = localStorage.getItem('userId');
      
      if (!token || !currentUserId) {
        console.error('No token or user ID found');
        return;
      }
      
      const post = posts.find(p => p._id === postId);
      const isLiked = post?.likes.some((like: any) => like.user.toString() === currentUserId);

      console.log('Liking/unliking post:', postId, 'isLiked:', isLiked);
      
      if (isLiked) {
        await api.put(`/posts/unlike/${postId}`);
      } else {
        await api.put(`/posts/like/${postId}`);
      }
      
      // Refresh posts to show updated likes
      const postsResponse = await api.get('/posts');
      const allPosts = postsResponse.data;
      const userPosts = allPosts.filter((post: Post) => post.user === userId);
      setPosts(userPosts);
    } catch (err: any) {
      console.error('Failed to update like:', err);
      console.error('Like error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return;
    
    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('userId');
    
    if (!token || !currentUserId) {
      console.error('No token or user ID found');
      return;
    }
    
    setSubmittingComment(true);
    try {
      console.log('Adding comment to post:', postId, 'text:', commentText);
      await api.post(`/posts/comment/${postId}`, { text: commentText });
      setCommentText('');
      setCommentingPost(null);
      
      // Refresh posts to show new comment
      const postsResponse = await api.get('/posts');
      const allPosts = postsResponse.data;
      const userPosts = allPosts.filter((post: Post) => post.user === userId);
      setPosts(userPosts);
    } catch (err: any) {
      console.error('Failed to add comment:', err);
      console.error('Comment error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await api.delete(`/posts/comment/${postId}/${commentId}`);
        
        // Refresh posts to show updated comments
        const postsResponse = await api.get('/posts');
        const allPosts = postsResponse.data;
        const userPosts = allPosts.filter((post: Post) => post.user === userId);
        setPosts(userPosts);
      } catch (err: any) {
        console.error('Failed to delete comment:', err);
      }
    }
  };

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
              {posts.map((post) => {
                const currentUserId = localStorage.getItem('userId');
                const isLiked = post.likes.some((like: any) => like.user.toString() === currentUserId);

                return (
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
                    
                    {/* Like and Comment Actions */}
                    <div className="flex items-center space-x-4 mb-4">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center space-x-1 text-sm ${
                          isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <span>{isLiked ? '❤️' : '🤍'}</span>
                        <span>{post.likes.length} likes</span>
                      </button>
                      <button
                        onClick={() => setCommentingPost(commentingPost === post._id ? null : post._id)}
                        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                      >
                        <span>💬</span>
                        <span>{post.comments.length} comments</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {commentingPost === post._id && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Comments</h4>
                        
                        {/* Add Comment Form */}
                        <div className="mb-4">
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full p-2 border border-gray-300 rounded-md resize-none text-black"
                            rows={2}
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => handleComment(post._id)}
                              disabled={submittingComment || !commentText.trim()}
                              className="bg-black hover:bg-gray-800 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50"
                            >
                              {submittingComment ? 'Posting...' : 'Post Comment'}
                            </button>
                          </div>
                        </div>

                        {/* Display Comments */}
                        {post.comments.length > 0 && (
                          <div className="space-y-2">
                            {post.comments.map((comment: any) => (
                              <div key={comment._id} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                                <img
                                  src={comment.avatar}
                                  alt={comment.name}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm text-gray-900">{comment.name}</span>
                                    {comment.user === currentUserId && (
                                      <button
                                        onClick={() => handleDeleteComment(post._id, comment._id)}
                                        className="text-red-600 hover:text-red-800 text-xs"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 