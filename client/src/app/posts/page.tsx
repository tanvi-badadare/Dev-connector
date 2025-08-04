'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';

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
    avatar: string;
    user: string;
    date: string;
  }>;
  date: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPostText, setNewPostText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUser();
    fetchPosts();
  }, [router]);

  // Filter posts to show only current user's posts
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const myPosts = posts.filter(post => post.user === currentUserId);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      router.push('/login');
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      setPosts(response.data);
    } catch (err: any) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post('/posts', { text: newPostText });
      setPosts([response.data, ...posts]);
      setNewPostText('');
    } catch (err: any) {
      setError('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p._id === postId);
      const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      console.log('Current userId from localStorage:', currentUserId); // Debug log
      
      if (!currentUserId) {
        setError(`User not authenticated. userId: ${currentUserId}`);
        return;
      }
      
      const isLiked = post?.likes.some(like => like.user.toString() === currentUserId);
      console.log('Current user ID:', currentUserId);
      console.log('Post likes:', post?.likes);
      console.log('Is liked:', isLiked);
      
      if (isLiked) {
        console.log('Calling unlike endpoint');
        await api.put(`/posts/unlike/${postId}`);
      } else {
        console.log('Calling like endpoint');
        await api.put(`/posts/like/${postId}`);
      }
      
      fetchPosts(); // Refresh posts to get updated likes
    } catch (err: any) {
      console.error('Like error:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Failed to update like');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      console.log('Attempting to delete post:', postId);
      console.log('Current token:', localStorage.getItem('token'));
      console.log('Current userId:', localStorage.getItem('userId'));
      
      const response = await api.delete(`/posts/${postId}`);
      console.log('Delete response:', response);
      setPosts(posts.filter(post => post._id !== postId));
    } catch (err: any) {
      console.error('Delete error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        err: err
      });
      setError(`Delete failed: ${err.response?.data?.msg || err.message || 'Unknown error'}`);
    }
  };

  const handleComment = async (postId: string, commentText: string) => {
    try {
      await api.post(`/posts/comment/${postId}`, { text: commentText });
      fetchPosts(); // Refresh posts to get updated comments
    } catch (err: any) {
      setError('Failed to add comment');
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`/posts/comment/${postId}/${commentId}`);
      fetchPosts(); // Refresh posts to get updated comments
    } catch (err: any) {
      setError('Failed to delete comment');
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
        onLogout={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          router.push('/');
        }}
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

        {/* Posts Feed */}
        <div className="space-y-6">
          {myPosts.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 text-lg">You haven't created any posts yet</p>
              <p className="text-gray-400 text-sm mt-2">Create your first post above!</p>
            </div>
          ) : (
            myPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={() => handleLike(post._id)}
                onDelete={() => handleDeletePost(post._id)}
                onComment={(commentText) => handleComment(post._id, commentText)}
                onDeleteComment={(commentId) => handleDeleteComment(post._id, commentId)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Post Card Component
function PostCard({ 
  post, 
  onLike, 
  onDelete, 
  onComment, 
  onDeleteComment 
}: {
  post: Post;
  onLike: () => void;
  onDelete: () => void;
  onComment: (text: string) => void;
  onDeleteComment: (commentId: string) => void;
}) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const isLiked = currentUserId ? post.likes.some(like => like.user.toString() === currentUserId) : false;
  const isOwnPost = currentUserId ? post.user.toString() === currentUserId : false;

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    onComment(commentText);
    setCommentText('');
    setShowCommentForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <img
          src={post.avatar}
          alt={post.name}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h3 className="font-semibold text-black">{post.name}</h3>
          <p className="text-sm text-gray-500">
            {new Date(post.date).toLocaleDateString()}
          </p>
        </div>
        {isOwnPost && (
          <button
            onClick={onDelete}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>

      <p className="text-gray-800 mb-4">{post.text}</p>

      {/* Actions */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={onLike}
          className={`flex items-center space-x-1 ${
            isLiked ? 'text-blue-500' : 'text-gray-500'
          } hover:text-blue-500`}
        >
          <span>👍</span>
          <span>{post.likes.length} likes</span>
        </button>
        <button
          onClick={() => setShowCommentForm(!showCommentForm)}
          className="text-gray-500 hover:text-blue-500"
        >
          💬 {post.comments.length} comments
        </button>
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <form onSubmit={handleSubmitComment} className="mb-4">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-2 border border-gray-300 rounded-md resize-none text-black"
            rows={2}
            required
          />
          <div className="flex space-x-2 mt-2">
            <button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white font-bold py-1 px-3 rounded text-sm"
            >
              Comment
            </button>
            <button
              type="button"
              onClick={() => setShowCommentForm(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-3 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Comments */}
      {post.comments.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2 text-black">Comments</h4>
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <div key={comment._id} className="flex items-start space-x-2">
                <img
                  src={comment.avatar}
                  alt={comment.name}
                  className="w-6 h-6 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-black">{comment.name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.date).toLocaleDateString()}
                    </span>
                    {currentUserId && comment.user.toString() === currentUserId && (
                      <button
                        onClick={() => onDeleteComment(comment._id)}
                        className="text-red-500 hover:text-red-700 text-xs"
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
        </div>
      )}
    </div>
  );
} 