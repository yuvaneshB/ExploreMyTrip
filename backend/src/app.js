import './config/env.js';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cron from 'node-cron';
import path from 'path';
import fs from 'fs';

// Database & configs
import connectDB from './config/db.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { checkExpiredHolds } from './controllers/bookingController.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import tourRoutes from './routes/tourRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import countryRoutes from './routes/countryRoutes.js';
import discoverRoutes from './routes/discoverRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import agentTourRoutes from './routes/agentTourRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';






// Create directories for uploads
const publicDirs = ['./public/uploads', './public/invoices', './public/exports'];
publicDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create Express Application
const app = express();
const server = http.createServer(app);

// Socket.IO Server configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // Adjust to specific frontend domain in production
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach socket context to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware chains
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local static files on the frontend
}));
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://explore-my-trip-git-main-yuvaneshbs-projects.vercel.app'
];
if (process.env.FRONTEND_URL) {
  const cleanFront = process.env.FRONTEND_URL.replace(/\/$/, '');
  if (!allowedOrigins.includes(cleanFront)) {
    allowedOrigins.push(cleanFront);
  }
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(cleanOrigin) || cleanOrigin.startsWith('http://192.168.')) {
      callback(null, true);
    } else {
      callback(null, false); // Deny CORS cleanly without throwing 500 error
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Serve Static Upload directories
app.use('/uploads', express.static(path.resolve('./public/uploads')));
app.use('/uploads/invoices', express.static(path.resolve('./public/invoices')));
app.use('/uploads/exports', express.static(path.resolve('./public/exports')));

// Global API rate limiting
app.use('/api', apiLimiter);

// API Endpoints mounting
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/v1/destinations', destinationRoutes);
app.use('/api/v1/agent-tours', agentTourRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);




// Fallback Route
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Global Error Handler
app.use(errorHandler);

// Cron Scheduler: seat inventory hold release checks (every 60 seconds)
cron.schedule('* * * * *', async () => {
  console.log('Running scheduled check for expired seat holds...');
  await checkExpiredHolds();
});

// Socket connection notifications
io.on('connection', (socket) => {
  console.log('Client connected to Socket.IO:', socket.id);

  // Group roles for localized socket rooms
  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room: ${roomName}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// DB Connect and Server Listen
const PORT = process.env.PORT || 4000;
connectDB().then(async () => {
  // Auto-seeding check inside the running server process
  try {
    const Category = (await import('./models/category.js')).default;
    const count = await Category.countDocuments();
    if (count === 0) {
      console.log('Real MongoDB collections are empty. Seeding defaults...');
      const { seedDatabase } = await import('./utilities/seed.js');
      await seedDatabase();
    } else {
      console.log('Real MongoDB database contains existing categories. Skipping auto-seed.');
    }
  } catch (seedErr) {
    console.error('Auto-seed check failed:', seedErr.message);
  }

  server.listen(PORT, () => {
    console.log(`ExploreMyTrip backend server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database connection:', err.message);
});
// End of app file.
