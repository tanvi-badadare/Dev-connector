import { z } from 'zod';

// User validation schemas
export const userRegisterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please include a valid email'),
  password: z.string().min(6, 'Please enter a password with 6 or more characters')
});

export const userLoginSchema = z.object({
  email: z.string().email('Please include a valid email'),
  password: z.string().min(1, 'Password is required')
});

// Profile validation schemas
export const profileSchema = z.object({
  status: z.string().min(1, 'Status is required'),
  skills: z.string().min(1, 'Skills is required'),
  company: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  bio: z.string().optional(),
  githubusername: z.string().optional(),
  youtube: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  facebook: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal(''))
});

export const experienceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().optional(),
  from: z.string().min(1, 'From date is required'),
  to: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional()
});

export const educationSchema = z.object({
  school: z.string().min(1, 'School is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldofstudy: z.string().min(1, 'Field of study is required'),
  from: z.string().min(1, 'From date is required'),
  to: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional()
});

// Post validation schemas
export const postSchema = z.object({
  text: z.string().min(1, 'Text is required')
});

export const commentSchema = z.object({
  text: z.string().min(1, 'Text is required')
});

// Utility function to handle Zod validation errors
export const handleValidationError = (error) => {
  if (error instanceof z.ZodError) {
    const errors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    return { errors };
  }
  return { errors: [{ message: 'Validation failed' }] };
}; 