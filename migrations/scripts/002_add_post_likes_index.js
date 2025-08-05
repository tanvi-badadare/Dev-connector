// Migration: add_post_likes_index
// Description: Add indexes for post likes and comments for better performance
// Created: 2024-01-01T00:00:00.000Z

export default async function up(db) {
  console.log('Running migration: add_post_likes_index');
  
  // Create indexes for post interactions
  await db.collection('posts').createIndex({ 'likes.user': 1 });
  await db.collection('posts').createIndex({ 'comments.user': 1 });
  await db.collection('posts').createIndex({ 'comments.date': -1 });
  
  console.log('✅ Created post interaction indexes');
}

export async function rollback(db) {
  console.log('Rolling back migration: add_post_likes_index');
  
  // Drop indexes
  await db.collection('posts').dropIndex('likes.user_1');
  await db.collection('posts').dropIndex('comments.user_1');
  await db.collection('posts').dropIndex('comments.date_-1');
  
  console.log('✅ Dropped post interaction indexes');
} 