import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import { query } from '../../config/database.js';
import { generateTokens, logAction } from '../middleware/auth.js';

// =============================================
// REGISTER
// =============================================
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check email exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password - cost 12 is strong enough for production
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.toLowerCase(), passwordHash]
    );

    const user = result.rows[0];
    const tokens = await generateTokens(user.id);

    await logAction(user.id, 'USER_REGISTER', 'users', user.id, null, { email: user.email }, req);

    return res.status(201).json({
      message: 'Account created successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================================
// LOGIN
// =============================================
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const result = await query(
      'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    // Timing-safe: always compare even if user not found
    const user = result.rows[0];
    const dummyHash = '$2a$12$dummy.hash.for.timing.safety.only.padding';
    const isValid = await bcrypt.compare(password, user?.password_hash || dummyHash);

    if (!user || !isValid || !user.is_active) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const tokens = await generateTokens(user.id);

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    await logAction(user.id, 'USER_LOGIN', 'users', user.id, null, null, req);

    return res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================================
// LOGOUT
// =============================================
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE token_hash = $1',
        [tokenHash]
      );
    }

    await logAction(req.user?.id, 'USER_LOGOUT', 'users', req.user?.id, null, null, req);

    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================================
// GET ME
// =============================================
export const getMe = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    return res.json({ user: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
