// Migration: initial_setup
// Description: Initial database setup with indexes and constraints
// Created: 2024-01-01T00:00:00.000Z

export default async function up(db) {
  console.log('Running migration: initial_setup');
  
  // Create indexes for better performance
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('profiles').createIndex({ user: 1 }, { unique: true });
  await db.collection('posts').createIndex({ user: 1 });
  await db.collection('posts').createIndex({ date: -1 });
  await db.collection('migrations').createIndex({ name: 1 }, { unique: true });
  
  console.log('✅ Created database indexes');
}

export async function rollback(db) {
  console.log('Rolling back migration: initial_setup');
  
  // Drop indexes
  await db.collection('users').dropIndex('email_1');
  await db.collection('profiles').dropIndex('user_1');
  await db.collection('posts').dropIndex('user_1');
  await db.collection('posts').dropIndex('date_-1');
  await db.collection('migrations').dropIndex('name_1');
  
  console.log('✅ Dropped database indexes');
} 