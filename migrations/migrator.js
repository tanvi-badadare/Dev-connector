import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Migration from './Migration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Migrator {
  constructor() {
    this.migrationsPath = path.join(__dirname, 'scripts');
    this.connection = null;
  }

  // Generate checksum for migration file
  generateChecksum(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  // Get all migration files
  async getMigrationFiles() {
    try {
      const files = await fs.readdir(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.js'))
        .sort();
    } catch (error) {
      console.error('Error reading migration files:', error);
      return [];
    }
  }

  // Load migration script
  async loadMigration(fileName) {
    try {
      const filePath = path.join(this.migrationsPath, fileName);
      const content = await fs.readFile(filePath, 'utf8');
      const checksum = this.generateChecksum(content);
      
      // Extract version from filename (e.g., 001_initial_setup.js -> 001)
      const version = fileName.split('_')[0];
      
      return {
        name: fileName,
        version,
        content,
        checksum,
        filePath
      };
    } catch (error) {
      console.error(`Error loading migration ${fileName}:`, error);
      throw error;
    }
  }

  // Check if migration has been applied
  async isMigrationApplied(migration) {
    const existingMigration = await Migration.findOne({ 
      name: migration.name,
      checksum: migration.checksum,
      status: 'completed'
    });
    return !!existingMigration;
  }

  // Execute a single migration
  async executeMigration(migration, options = {}) {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Executing migration: ${migration.name}`);
      
      // Check if already applied
      if (!options.force && await this.isMigrationApplied(migration)) {
        console.log(`✅ Migration ${migration.name} already applied, skipping`);
        return { success: true, skipped: true };
      }

      // Update migration status to running
      await Migration.findOneAndUpdate(
        { name: migration.name },
        { 
          status: 'running',
          appliedAt: new Date()
        },
        { upsert: true }
      );

      // Import and execute migration
      const migrationModule = await import(migration.filePath);
      const migrationFunction = migrationModule.default || migrationModule;
      
      if (typeof migrationFunction !== 'function') {
        throw new Error(`Migration ${migration.name} does not export a function`);
      }

      // Execute migration with database connection
      await migrationFunction(this.connection);

      const executionTime = Date.now() - startTime;

      // Update migration record
      await Migration.findOneAndUpdate(
        { name: migration.name },
        {
          version: migration.version,
          checksum: migration.checksum,
          status: 'completed',
          executionTime,
          appliedAt: new Date(),
          error: null
        },
        { upsert: true }
      );

      console.log(`✅ Migration ${migration.name} completed successfully (${executionTime}ms)`);
      return { success: true, executionTime };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // Update migration record with error
      await Migration.findOneAndUpdate(
        { name: migration.name },
        {
          status: 'failed',
          error: error.message,
          executionTime
        },
        { upsert: true }
      );

      console.error(`❌ Migration ${migration.name} failed:`, error.message);
      return { success: false, error: error.message, executionTime };
    }
  }

  // Run all pending migrations
  async runMigrations(options = {}) {
    try {
      console.log('🚀 Starting migration process...');
      
      // Ensure database connection
      if (!this.connection) {
        await connectDB();
        this.connection = mongoose.connection;
      }

      const migrationFiles = await this.getMigrationFiles();
      
      if (migrationFiles.length === 0) {
        console.log('📝 No migration files found');
        return { success: true, migrationsRun: 0 };
      }

      console.log(`📋 Found ${migrationFiles.length} migration files`);

      let successCount = 0;
      let failureCount = 0;
      let skippedCount = 0;

      for (const fileName of migrationFiles) {
        const migration = await this.loadMigration(fileName);
        const result = await this.executeMigration(migration, options);
        
        if (result.success) {
          if (result.skipped) {
            skippedCount++;
          } else {
            successCount++;
          }
        } else {
          failureCount++;
          if (options.stopOnError) {
            console.log('⏹️  Stopping on error');
            break;
          }
        }
      }

      console.log(`\n📊 Migration Summary:`);
      console.log(`✅ Successful: ${successCount}`);
      console.log(`⏭️  Skipped: ${skippedCount}`);
      console.log(`❌ Failed: ${failureCount}`);

      return {
        success: failureCount === 0,
        migrationsRun: successCount,
        migrationsSkipped: skippedCount,
        migrationsFailed: failureCount
      };

    } catch (error) {
      console.error('💥 Migration process failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Rollback migrations
  async rollbackMigrations(count = 1, options = {}) {
    try {
      console.log(`🔄 Rolling back ${count} migration(s)...`);
      
      // Ensure database connection
      if (!this.connection) {
        await connectDB();
        this.connection = mongoose.connection;
      }
      
      // Get completed migrations in reverse order
      const completedMigrations = await Migration.find({ 
        status: 'completed' 
      }).sort({ appliedAt: -1 }).limit(count);

      if (completedMigrations.length === 0) {
        console.log('📝 No completed migrations to rollback');
        return { success: true, rollbacksRun: 0 };
      }

      let rollbackCount = 0;
      let failureCount = 0;

      for (const migrationRecord of completedMigrations) {
        try {
          console.log(`🔄 Rolling back: ${migrationRecord.name}`);
          
          const migration = await this.loadMigration(migrationRecord.name);
          
          // Import and execute rollback
          const migrationModule = await import(migration.filePath);
          const rollbackFunction = migrationModule.rollback || migrationModule.default;
          
          if (typeof rollbackFunction !== 'function') {
            console.warn(`⚠️  No rollback function found for ${migrationRecord.name}`);
            continue;
          }

          await rollbackFunction(this.connection, true); // true indicates rollback

          // Mark migration as rolled back
          await Migration.findOneAndUpdate(
        { name: migrationRecord.name },
        { rollback: true }
      );

          rollbackCount++;
          console.log(`✅ Rolled back: ${migrationRecord.name}`);

        } catch (error) {
          failureCount++;
          console.error(`❌ Rollback failed for ${migrationRecord.name}:`, error.message);
          
          if (options.stopOnError) {
            break;
          }
        }
      }

      console.log(`\n📊 Rollback Summary:`);
      console.log(`✅ Rolled back: ${rollbackCount}`);
      console.log(`❌ Failed: ${failureCount}`);

      return {
        success: failureCount === 0,
        rollbacksRun: rollbackCount,
        rollbacksFailed: failureCount
      };

    } catch (error) {
      console.error('💥 Rollback process failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get migration status
  async getMigrationStatus() {
    try {
      // Ensure database connection
      if (!this.connection) {
        await connectDB();
        this.connection = mongoose.connection;
      }
      
      const allMigrations = await Migration.find().sort({ appliedAt: 1 });
      const migrationFiles = await this.getMigrationFiles();
      
      const status = {
        total: migrationFiles.length,
        applied: allMigrations.filter(m => m.status === 'completed').length,
        pending: migrationFiles.length - allMigrations.filter(m => m.status === 'completed').length,
        failed: allMigrations.filter(m => m.status === 'failed').length,
        migrations: []
      };

      for (const fileName of migrationFiles) {
        const migration = await this.loadMigration(fileName);
        const dbRecord = allMigrations.find(m => m.name === fileName);
        
        status.migrations.push({
          name: fileName,
          version: migration.version,
          status: dbRecord?.status || 'pending',
          appliedAt: dbRecord?.appliedAt,
          executionTime: dbRecord?.executionTime,
          error: dbRecord?.error,
          rollback: dbRecord?.rollback || false
        });
      }

      return status;
    } catch (error) {
      console.error('Error getting migration status:', error);
      throw error;
    }
  }

  // Create new migration file
  async createMigration(name, description) {
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
      const fileName = `${timestamp}_${name}.js`;
      const filePath = path.join(this.migrationsPath, fileName);
      
      const template = `// Migration: ${name}
// Description: ${description}
// Created: ${new Date().toISOString()}

export default async function up(db) {
  // TODO: Implement migration logic
  console.log('Running migration: ${name}');
  
  // Example:
  // await db.collection('users').createIndex({ email: 1 }, { unique: true });
}

export async function rollback(db) {
  // TODO: Implement rollback logic
  console.log('Rolling back migration: ${name}');
  
  // Example:
  // await db.collection('users').dropIndex('email_1');
}
`;

      await fs.writeFile(filePath, template);
      console.log(`✅ Created migration file: ${fileName}`);
      return fileName;
    } catch (error) {
      console.error('Error creating migration file:', error);
      throw error;
    }
  }
}

export default Migrator; 