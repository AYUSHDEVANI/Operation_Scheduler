const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const connectDB = require('./config/db');
const logger = require('./logs/logger');

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
// app.use('/api', limiter); // Temporarily disabled to debug socket/login issues

// Data Sanitization
app.use(mongoSanitize());
app.use(xss());

// Middleware
// CORS (Allow only specific origins if needed, currently global for dev)
app.use(cors());

// Body Parser
app.use(express.json());

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Database Connection
connectDB();

// Routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const otRoutes = require('./routes/otRoutes');
const surgeryRoutes = require('./routes/surgeryRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const surgeryTrackingRoutes = require('./routes/surgeryTrackingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/ots', otRoutes);
app.use('/api/surgeries', surgeryRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/surgery-tracking', surgeryTrackingRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  // logger.error(err.message);
  console.error(err); // Ensure it prints to console at least
  res.status(500).json({ message: 'Server Error', error: err.message, stack: err.stack });
});

const http = require('http');
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev simplicity
    methods: ["GET", "POST"]
  }
});

// Pass io to app so it can be accessed in controllers
app.set('io', io);

io.on('connection', (socket) => {
  // console.log('New client connected', socket.id);
  socket.on('disconnect', () => {
    // console.log('Client disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
