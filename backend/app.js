const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Updated CORS origins to include frontend URL
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'https://hrms-leave-management-vishal.vercel.app'  // Added frontend URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization',
    'Cache-Control'
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// Import route modules
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const leaveRoutes = require('./routes/leaves');
const holidaysRoutes = require('./routes/holidays');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');

// Mount routes
app.use('/auth', cors(corsOptions), authRoutes);
app.use('/employees', cors(corsOptions), employeeRoutes);
app.use('/leaves', cors(corsOptions), leaveRoutes);
app.use('/holidays', cors(corsOptions), holidaysRoutes);
app.use('/analytics', cors(corsOptions), analyticsRoutes);
app.use('/admin', cors(corsOptions), adminRoutes);

// Root and health check routes
app.get('/', cors(corsOptions), (req, res) => {
  res.json({ 
    message: 'HRMS API Running Successfully! 🚀',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      employees: '/employees', 
      leaves: '/leaves',
      holidays: '/holidays',
      analytics: '/analytics',
      admin: '/admin'
    }
  });
});

app.get('/health', cors(corsOptions), (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    database: 'connected',
    uptime: process.uptime()
  });
});

// Error handlers
app.use((error, req, res, next) => {
  console.error('❌ Global error:', error);
  const origin = req.headers.origin;
  if (corsOptions.origin.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

app.use('*', cors(corsOptions), (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
    availableRoutes: ['/auth', '/employees', '/leaves', '/holidays', '/analytics', '/admin'],
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 HRMS Server running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 CORS enabled for origins:`, corsOptions.origin);
  console.log(`📝 Available endpoints:`);
  console.log(`   - Auth: http://localhost:${PORT}/auth`);
  console.log(`   - Employees: http://localhost:${PORT}/employees`);
  console.log(`   - Leaves: http://localhost:${PORT}/leaves`);
  console.log(`   - Holidays: http://localhost:${PORT}/holidays`);
  console.log(`   - Analytics: http://localhost:${PORT}/analytics`);
  console.log(`   - Admin: http://localhost:${PORT}/admin`);
});

module.exports = app;
