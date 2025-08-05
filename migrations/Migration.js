import mongoose from 'mongoose';

const MigrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  version: {
    type: String,
    required: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  checksum: {
    type: String,
    required: true
  },
  executionTime: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  error: {
    type: String
  },
  rollback: {
    type: Boolean,
    default: false
  }
});

const Migration = mongoose.model('migration', MigrationSchema);

export default Migration; 