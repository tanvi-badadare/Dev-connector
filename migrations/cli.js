#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import Migrator from './migrator.js';

const program = new Command();
const migrator = new Migrator();

program
  .name('migrate')
  .description('Database migration tool')
  .version('1.0.0');

// Run migrations
program
  .command('up')
  .description('Run pending migrations')
  .option('-f, --force', 'Force run migrations even if already applied')
  .option('-s, --stop-on-error', 'Stop on first error')
  .action(async (options) => {
    try {
      const result = await migrator.runMigrations(options);
      if (result.success) {
        console.log('✅ All migrations completed successfully');
        process.exit(0);
      } else {
        console.log('❌ Some migrations failed');
        process.exit(1);
      }
    } catch (error) {
      console.error('💥 Migration failed:', error.message);
      process.exit(1);
    }
  });

// Rollback migrations
program
  .command('down')
  .description('Rollback migrations')
  .option('-c, --count <number>', 'Number of migrations to rollback', '1')
  .option('-s, --stop-on-error', 'Stop on first error')
  .action(async (options) => {
    try {
      const count = parseInt(options.count);
      const result = await migrator.rollbackMigrations(count, options);
      if (result.success) {
        console.log('✅ Rollback completed successfully');
        process.exit(0);
      } else {
        console.log('❌ Some rollbacks failed');
        process.exit(1);
      }
    } catch (error) {
      console.error('💥 Rollback failed:', error.message);
      process.exit(1);
    }
  });

// Show migration status
program
  .command('status')
  .description('Show migration status')
  .action(async () => {
    try {
      const status = await migrator.getMigrationStatus();
      
      console.log('\n📊 Migration Status:');
      console.log(`Total migrations: ${status.total}`);
      console.log(`Applied: ${status.applied}`);
      console.log(`Pending: ${status.pending}`);
      console.log(`Failed: ${status.failed}`);
      
      if (status.migrations.length > 0) {
        console.log('\n📋 Migration Details:');
        status.migrations.forEach(migration => {
          const statusIcon = migration.status === 'completed' ? '✅' : 
                           migration.status === 'failed' ? '❌' : '⏳';
          const rollbackIcon = migration.rollback ? '🔄' : '';
          
          console.log(`${statusIcon} ${migration.name} ${rollbackIcon}`);
          if (migration.appliedAt) {
            console.log(`   Applied: ${migration.appliedAt.toLocaleString()}`);
          }
          if (migration.executionTime) {
            console.log(`   Duration: ${migration.executionTime}ms`);
          }
          if (migration.error) {
            console.log(`   Error: ${migration.error}`);
          }
          console.log('');
        });
      }
    } catch (error) {
      console.error('💥 Error getting status:', error.message);
      process.exit(1);
    }
  });

// Create new migration
program
  .command('create')
  .description('Create a new migration file')
  .argument('<name>', 'Migration name')
  .option('-d, --description <text>', 'Migration description', '')
  .action(async (name, options) => {
    try {
      const fileName = await migrator.createMigration(name, options.description);
      console.log(`✅ Created migration: ${fileName}`);
      console.log(`📝 Edit the file to implement your migration logic`);
    } catch (error) {
      console.error('💥 Error creating migration:', error.message);
      process.exit(1);
    }
  });

// Reset migrations (for development)
program
  .command('reset')
  .description('Reset all migrations (development only)')
  .option('-y, --yes', 'Skip confirmation')
  .action(async (options) => {
    try {
      if (!options.yes) {
        const readline = await import('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise(resolve => {
          rl.question('⚠️  This will reset all migrations. Are you sure? (y/N): ', resolve);
        });
        rl.close();
        
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          console.log('❌ Reset cancelled');
          return;
        }
      }
      
      // Clear all migration records
      const Migration = (await import('./Migration.js')).default;
      await Migration.deleteMany({});
      console.log('✅ Migration history reset');
    } catch (error) {
      console.error('💥 Error resetting migrations:', error.message);
      process.exit(1);
    }
  });

program.parse(); 