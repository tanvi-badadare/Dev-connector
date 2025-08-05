'use client';

import { useState, useEffect } from 'react';
import api from '../services/api';
import ExperienceForm from './ExperienceForm';
import EducationForm from './EducationForm';

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
  experience?: Array<{
    _id: string;
    title: string;
    company: string;
    location: string;
    from: string;
    to: string;
    current: boolean;
    description: string;
  }>;
  education?: Array<{
    _id: string;
    school: string;
    degree: string;
    fieldofstudy: string;
    from: string;
    to: string;
    current: boolean;
    description: string;
  }>;
}

interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
}

interface EnhancedProfileDisplayProps {
  profile: Profile;
  isOwnProfile?: boolean;
}

export default function EnhancedProfileDisplay({ profile, isOwnProfile = false }: EnhancedProfileDisplayProps) {
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState<any>(null);
  const [editingEducation, setEditingEducation] = useState<any>(null);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  useEffect(() => {
    if (profile.githubusername) {
      fetchGithubRepos();
    }
  }, [profile.githubusername]);

  const fetchGithubRepos = async () => {
    if (!profile.githubusername || profile.githubusername.trim() === '' || profile.githubusername === 'your-github-username') {
      console.log('No valid GitHub username provided:', profile.githubusername);
      return;
    }
    
    setLoadingRepos(true);
    try {
      console.log('Fetching GitHub repos for username:', profile.githubusername);
      const response = await api.get(`/profile/github/${profile.githubusername}`);
      console.log('GitHub repos response:', response.data);
      setGithubRepos(response.data);
    } catch (err: any) {
      console.log('GitHub repos not available for username:', profile.githubusername);
      // Silently handle the error - don't log detailed error info
      setGithubRepos([]);
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleDeleteExperience = async (expId: string) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      try {
        await api.delete(`/profile/experience/${expId}`);
        window.location.reload();
      } catch (err: any) {
        console.error('Failed to delete experience:', err);
      }
    }
  };

  const handleDeleteEducation = async (eduId: string) => {
    if (window.confirm('Are you sure you want to delete this education?')) {
      try {
        await api.delete(`/profile/education/${eduId}`);
        window.location.reload();
      } catch (err: any) {
        console.error('Failed to delete education:', err);
      }
    }
  };

  const handleAddExperience = () => {
    setEditingExperience(null);
    setShowExperienceForm(true);
  };

  const handleEditExperience = (experience: any) => {
    setEditingExperience(experience);
    setShowExperienceForm(true);
  };

  const handleAddEducation = () => {
    setEditingEducation(null);
    setShowEducationForm(true);
  };

  const handleEditEducation = (education: any) => {
    setEditingEducation(education);
    setShowEducationForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <img
              src={profile.user.avatar}
              alt={profile.user.name}
              className="w-20 h-20 rounded-full mr-6"
            />
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{profile.user.name}</h2>
              <p className="text-xl text-gray-600">{profile.status}</p>
              {profile.company && (
                <p className="text-gray-600">at {profile.company}</p>
              )}
              {profile.location && (
                <p className="text-gray-600">{profile.location}</p>
              )}
            </div>
          </div>
          {isOwnProfile && (
            <button
              onClick={() => window.location.href = '/profile/edit'}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
            >
              Edit
            </button>
          )}
        </div>

        {profile.bio && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.social && Object.values(profile.social).some(social => social) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Links</h3>
            <div className="flex flex-wrap gap-3">
              {profile.social.youtube && (
                <a href={profile.social.youtube} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800 font-medium">
                  YouTube
                </a>
              )}
              {profile.social.twitter && (
                <a href={profile.social.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600 font-medium">
                  Twitter
                </a>
              )}
              {profile.social.facebook && (
                <a href={profile.social.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
                  Facebook
                </a>
              )}
              {profile.social.linkedin && (
                <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 font-medium">
                  LinkedIn
                </a>
              )}
              {profile.social.instagram && (
                <a href={profile.social.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800 font-medium">
                  Instagram
                </a>
              )}
              {profile.githubusername && (
                <a href={`https://github.com/${profile.githubusername}`} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-gray-600 font-medium">
                  GitHub
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Experience Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Experience</h3>
          {isOwnProfile && (
            <button
              onClick={handleAddExperience}
              className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
            >
              Add Experience
            </button>
          )}
        </div>

        {profile.experience && profile.experience.length > 0 ? (
          <div className="space-y-4">
            {profile.experience.map((exp) => (
              <div key={exp._id} className="border-l-4 border-blue-500 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(exp.from)} - {exp.current ? 'Present' : formatDate(exp.to)}
                    </p>
                    {exp.location && (
                      <p className="text-sm text-gray-500">{exp.location}</p>
                    )}
                    {exp.description && (
                      <p className="text-gray-700 mt-2">{exp.description}</p>
                    )}
                  </div>
                  {isOwnProfile && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditExperience(exp)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExperience(exp._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No experience listed</p>
        )}
      </div>

      {/* Education Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Education</h3>
          {isOwnProfile && (
            <button
              onClick={handleAddEducation}
              className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
            >
              Add Education
            </button>
          )}
        </div>

        {profile.education && profile.education.length > 0 ? (
          <div className="space-y-4">
            {profile.education.map((edu) => (
              <div key={edu._id} className="border-l-4 border-green-500 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                    <p className="text-gray-600">{edu.school}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(edu.from)} - {edu.current ? 'Present' : formatDate(edu.to)}
                    </p>
                    <p className="text-sm text-gray-500">{edu.fieldofstudy}</p>
                    {edu.description && (
                      <p className="text-gray-700 mt-2">{edu.description}</p>
                    )}
                  </div>
                  {isOwnProfile && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditEducation(edu)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEducation(edu._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No education listed</p>
        )}
      </div>

      {/* GitHub Repositories Section */}
      {profile.githubusername && profile.githubusername.trim() !== '' && profile.githubusername !== 'your-github-username' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">GitHub Repositories</h3>
          
          {loadingRepos ? (
            <p className="text-gray-500">Loading repositories...</p>
          ) : githubRepos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {githubRepos.slice(0, 6).map((repo) => (
                <div key={repo.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    <a 
                      href={repo.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600"
                    >
                      {repo.name}
                    </a>
                  </h4>
                  {repo.description && (
                    <p className="text-gray-600 text-sm mb-2">{repo.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {repo.language && (
                      <span>{repo.language}</span>
                    )}
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No repositories found for this GitHub username
            </p>
          )}
        </div>
      )}

      {/* Modal Forms */}
      {showExperienceForm && (
        <ExperienceForm
          onClose={() => setShowExperienceForm(false)}
          onSuccess={() => window.location.reload()}
          experience={editingExperience}
        />
      )}

      {showEducationForm && (
        <EducationForm
          onClose={() => setShowEducationForm(false)}
          onSuccess={() => window.location.reload()}
          education={editingEducation}
        />
      )}
    </div>
  );
} 