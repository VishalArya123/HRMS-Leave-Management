const jwt = require('jsonwebtoken');
const { CORS_OPTIONS } = require('./constants');

const JWT_SECRET = process.env.JWT_SECRET || 'hrms_super_secret_key_change_in_production';

function generateToken(user) {
  return jwt.sign({
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    department: user.department
  }, JWT_SECRET, { expiresIn: '8h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    console.error('❌ Token verification error:', e.message);
    return null;
  }
}

function authMiddleware(req, res, next) {
  // Set CORS headers for auth middleware
  const origin = req.headers.origin;
  if (CORS_OPTIONS.origin.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }
  
  const token = auth.slice(7);
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  req.user = user;
  console.log('🔐 Authenticated user:', user.name, `(${user.role})`);
  next();
}

module.exports = { generateToken, verifyToken, authMiddleware };
