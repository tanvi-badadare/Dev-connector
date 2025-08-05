import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import AutoMigrator from './migrations/autoMigrate.js';
import authRoutes from './routes/api/auth.js';
import userRoutes from './routes/api/users.js';
import postRoutes from './routes/api/posts.js';
import profileRoutes from './routes/api/profile.js';

const app = express();

// Connect to database
await connectDB();

// Run automatic migrations on startup
const autoMigrator = new AutoMigrator();
await autoMigrator.runOnStartup({ exitOnError: true });

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

// Define Routes 
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));



