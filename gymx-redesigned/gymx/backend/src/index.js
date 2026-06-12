import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const SHEET_URL = process.env.GOOGLE_SHEET_URL;

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const r = await fetch(SHEET_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'register', name, email, password }),
    });
    const data = await r.json();
    if (data.error) return res.status(400).json({ message: data.error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const r = await fetch(SHEET_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', email, password }),
    });
    const data = await r.json();
    if (data.error) return res.status(401).json({ message: data.error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Me
app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  res.json({ user: { id: '1', name: 'User', email: 'user@test.com', role: 'user' } });
});

// Logout
app.post('/api/auth/logout', (req, res) => res.json({ success: true }));

// Exercises (mock)
app.get('/api/exercises', (req, res) => res.json({ exercises: [], total: 0 }));
app.get('/api/exercises/muscle-groups', (req, res) => res.json({ muscleGroups: [] }));

// Programs (mock)
app.get('/api/programs', (req, res) => res.json({ programs: [] }));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.listen(PORT, () => {
  console.log(`🚀 GymX Backend running on port ${PORT}`);
});
