import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path'; // Added for production file paths

// Route files
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import houseRoutes from './routes/houseRoutes.js'; 

// Load env vars
dotenv.config();

// Connect to Database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount API Routers
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/houses', houseRoutes);

// Define __dirname for ES Modules
const __dirname = path.resolve();

// Production Hosting Logic
if (process.env.NODE_ENV === 'production') {
  // 1. Serve static files from the frontend's 'dist' folder
  // Note: '../dist' assumes your folder structure is /server and /dist in the same root
  app.use(express.static(path.join(__dirname, '../dist')));

  // 2. Handle React routing: send index.html for any request not matching an API route
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '..', 'dist', 'index.html'))
  );
} else {
  // Development mode home route
  app.get('/', (req, res) => {
    res.send('SDA Sports API is running in development mode...');
  });
}

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

// (Duplicate import and __dirname declaration removed)