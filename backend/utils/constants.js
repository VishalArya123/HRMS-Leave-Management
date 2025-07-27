exports.validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
exports.validRoles = ['employee', 'manager', 'admin'];
exports.validLeaveTypes = ['sick', 'casual', 'vacation', 'academic', 'wfh', 'compoff'];
exports.MAX_LOP_PER_YEAR = 10;

// CORS origins for all routes
exports.CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000', 
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://localhost:5174',
  'http://localhost:4173'
];

// Common CORS options
exports.CORS_OPTIONS = {
  origin: exports.CORS_ORIGINS,
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
