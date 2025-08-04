'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentingPost, setCommentingPost] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user data
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth');
        setUser(response.data);
        // Store user ID in localStorage
        localStorage.setItem('userId', response.data._id);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchPosts();
  }, [router]);

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts...');
      const response = await api.get('/posts');
      console.log('Posts response:', response.data);
      setPosts(response.data);
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      console.error('Posts error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
    } finally {
      setPostsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      await api.post('/posts', { text: newPostText });
      setNewPostText('');
      fetchPosts(); // Refresh posts to show the new post
    } catch (err: any) {
      setError('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      router.push('/');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const post = posts.find(p => p._id === postId);
      const isLiked = post?.likes.some((like: any) => like.user.toString() === currentUserId);

      console.log('Liking/unliking post:', postId, 'isLiked:', isLiked);
      
      if (isLiked) {
        await api.put(`/posts/unlike/${postId}`);
      } else {
        await api.put(`/posts/like/${postId}`);
      }
      fetchPosts();
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

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${postId}`);
        setPosts(posts.filter(post => post._id !== postId));
      } catch (err: any) {
        console.error('Delete error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
      }
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    try {
      await api.post(`/posts/comment/${postId}`, { text: commentText });
      setCommentText('');
      setCommentingPost(null);
      fetchPosts();
    } catch (err: any) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await api.delete(`/posts/comment/${postId}/${commentId}`);
        fetchPosts();
      } catch (err: any) {
        console.error('Failed to delete comment:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
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
              <a
                href="/profiles"
                className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
              >
                Find Developers
              </a>
            </div>
          </div>
        </div>
      </nav>

      <Sidebar 
        user={user} 
        onLogout={handleLogout} 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="max-w-4xl mx-auto py-6 px-4">
        {error && (
          <div className="mb-4 text-red-500 text-center bg-red-100 p-4 rounded border border-red-300">{error}</div>
        )}

        {/* Create Post Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Create Your Post</h2>
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded-md resize-none text-black"
              rows={3}
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-3 bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Community Posts</h2>
          <p className="text-gray-600">See what developers are sharing</p>
        </div>

        {postsLoading ? (
          <div className="text-center py-12">
            <div className="text-xl">Loading posts...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts yet. Be the first to share something!</p>
            <div className="mt-4">
              <a
                href="/posts"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Create Your First Post
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const currentUserId = localStorage.getItem('userId');
              const isLiked = post.likes.some((like: any) => like.user.toString() === currentUserId);
              const isOwnPost = post.user === currentUserId;

              return (
                <div key={post._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <img
                        src={post.avatar}
                        alt={post.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {isOwnPost ? (
                            'You'
                          ) : (
                            <a 
                              href={`/profile/${post.user}`}
                              className="hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              {post.name}
                            </a>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(post.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {isOwnPost && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
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
  );
} 
