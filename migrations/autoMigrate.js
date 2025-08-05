import Migrator from './migrator.js';

class AutoMigrator {
  constructor() {
    this.migrator = new Migrator();
  }

  // Run migrations automatically on server startup
  async runOnStartup(options = {}) {
    try {
      console.log('🔄 Running automatic migrations on startup...');
      
      const result = await this.migrator.runMigrations({
        force: false,
        stopOnError: true,
        ...options
      });

      if (result.success) {
        console.log('✅ Automatic migrations completed successfully');
        return true;
      } else {
        console.error('❌ Automatic migrations failed');
        if (options.exitOnError) {
          process.exit(1);
        }
        return false;
      }
    } catch (error) {
      console.error('💥 Automatic migration process failed:', error);
      if (options.exitOnError) {
        process.exit(1);
      }
      return false;
    }
  }

  // Check if migrations are needed
  async checkMigrationStatus() {
    try {
      const status = await this.migrator.getMigrationStatus();
      return {
        needsMigration: status.pending > 0,
        total: status.total,
        applied: status.applied,
        pending: status.pending,
        failed: status.failed
      };
    } catch (error) {
      console.error('Error checking migration status:', error);
      return { needsMigration: false, error: error.message };
    }
  }

  // Get detailed migration status
  async getDetailedStatus() {
    try {
      return await this.migrator.getMigrationStatus();
    } catch (error) {
      console.error('Error getting detailed migration status:', error);
      throw error;
    }
  }
}

export default AutoMigrator; 