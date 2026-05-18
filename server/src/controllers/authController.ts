import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '../utils/generateToken';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Please add all fields' });
      return;
    }

    // Check if user exists
    const userExists = await db.select().from(users).where(eq(users.email, email));

    if (userExists.length > 0) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await db.insert(users).values({
      name: name || '',
      email,
      password: hashedPassword,
    }).returning({ id: users.id, name: users.name, email: users.email });

    if (newUser.length > 0) {
      generateToken(res, newUser[0].id);
      res.status(201).json(newUser[0]);
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const userResult = await db.select().from(users).where(eq(users.email, email));

    if (userResult.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = userResult[0];

    // Check password
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      generateToken(res, user.id);
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req: Request, res: Response): void => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not found in request' });
      return;
    }

    const userResult = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
    }).from(users).where(eq(users.id, userId));

    if (userResult.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(userResult[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching profile' });
  }
};
