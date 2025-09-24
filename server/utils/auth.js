import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export function authMiddleware(req, res, next) {
  // Support Authorization: Bearer <token> or x-access-token: <token>
  const authHeader = req.headers.authorization || req.headers['x-access-token'];
  if (!authHeader) return res.status(401).json({ error: 'No token' });

  let token = null;
  if (typeof authHeader === 'string') {
    if (authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
    else token = authHeader; // allow raw token in x-access-token or other header
  }

  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
