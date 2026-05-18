import { Request, Response } from 'express';
import { db } from '../db';
import { users, taskGroups, tasks } from '../db/schema';
import { eq, and, lt } from 'drizzle-orm';

function getUserId(req: Request): string {
  return req.user!.id;
}

export const createGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { title, color } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const [group] = await db
      .insert(taskGroups)
      .values({ userId, title, color: color || 'purple' })
      .returning();

    res.status(201).json(group);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
};

export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const groupId = req.params.id as string;

    await db
      .delete(taskGroups)
      .where(and(eq(taskGroups.id, groupId), eq(taskGroups.userId, userId)));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { groupId, title } = req.body;
    if (!groupId || !title) {
      res.status(400).json({ error: 'groupId and title are required' });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    const [task] = await db
      .insert(tasks)
      .values({ userId, groupId, title, dueDate: today, originalDate: today })
      .returning();

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const toggleTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const taskId = req.params.id as string;
    const { completed } = req.body;

    const [task] = await db
      .update(tasks)
      .set({ completed, completedAt: completed ? new Date() : null })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    res.json(task);
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const taskId = req.params.id as string;

    await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

export const getToday = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const today = new Date().toISOString().slice(0, 10);

    const [profile] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (profile?.lastCarryDate !== today) {
      await db
        .update(tasks)
        .set({ dueDate: today, carried: true })
        .where(
          and(eq(tasks.userId, userId), eq(tasks.completed, false), lt(tasks.dueDate, today))
        );

      await db
        .update(users)
        .set({ lastCarryDate: today })
        .where(eq(users.id, userId));
    }

    const groups = await db.query.taskGroups.findMany({
      where: eq(taskGroups.userId, userId),
      with: {
        tasks: {
          where: eq(tasks.dueDate, today),
          orderBy: (cols, { asc }) => [asc(cols.createdAt)],
        },
      },
      orderBy: (cols, { asc }) => [asc(cols.createdAt)],
    });

    res.json(groups);
  } catch (error) {
    console.error('Get today error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);

    const groups = await db.query.taskGroups.findMany({
      where: eq(taskGroups.userId, userId),
      with: {
        tasks: {
          where: and(eq(tasks.dueDate, date), eq(tasks.completed, true)),
          orderBy: (cols, { asc }) => [asc(cols.completedAt)],
        },
      },
      orderBy: (cols, { asc }) => [asc(cols.createdAt)],
    });

    const filtered = groups.filter((g) => g.tasks.length > 0);
    res.json(filtered);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

export const getHistoryDates = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);

    const dates = await db
      .select({ date: tasks.dueDate })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.completed, true)))
      .groupBy(tasks.dueDate)
      .orderBy(tasks.dueDate);

    res.json(dates.map((d) => d.date));
  } catch (error) {
    console.error('Get dates error:', error);
    res.status(500).json({ error: 'Failed to fetch dates' });
  }
};
