import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const isProduction = process.env.NODE_ENV === 'production';

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || (
    isProduction ? false : ['http://localhost:8080', 'http://localhost:5173']
  ),
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Daylog API is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
