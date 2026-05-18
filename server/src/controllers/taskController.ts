import { Request, Response } from 'express';
import { db } from '../db';
import { users, taskGroups, tasks } from '../db/schema';
import { eq, and, lt } from 'drizzle-orm';

export const createGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const { title, color } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const [group] = await db
      .insert(taskGroups)
      .values({
        userId,
        title,
        color: color || 'purple',
      })
      .returning();

    res.status(201).json(group);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
};

export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    await db
      .delete(taskGroups)
      .where(and(eq(taskGroups.id, id), eq(taskGroups.userId, userId)));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const { groupId, title } = req.body;
    if (!groupId || !title) {
      res.status(400).json({ error: 'groupId and title are required' });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    const [task] = await db
      .insert(tasks)
      .values({
        userId,
        groupId,
        title,
        dueDate: today,
        originalDate: today,
      })
      .returning();

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const toggleTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { completed } = req.body;

    const [task] = await db
      .update(tasks)
      .set({
        completed,
        completedAt: completed ? new Date() : null,
      })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    res.json(task);
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

export const getToday = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    // Carry-forward: move incomplete past tasks to today
    const [profile] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (profile?.lastCarryDate !== today) {
      await db
        .update(tasks)
        .set({ dueDate: today, carried: true })
        .where(
          and(
            eq(tasks.userId, userId),
            eq(tasks.completed, false),
            lt(tasks.dueDate, today)
          )
        );

      await db
        .update(users)
        .set({ lastCarryDate: today })
        .where(eq(users.id, userId));
    }

    // Fetch today's groups with their tasks
    const groups = await db.query.taskGroups.findMany({
      where: eq(taskGroups.userId, userId),
      with: {
        tasks: {
          where: eq(tasks.dueDate, today),
          orderBy: (tasks, { asc }) => [asc(tasks.createdAt)],
        },
      },
      orderBy: (taskGroups, { asc }) => [asc(taskGroups.createdAt)],
    });

    res.json(groups);
  } catch (error) {
    console.error('Get today error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);

    const groups = await db.query.taskGroups.findMany({
      where: eq(taskGroups.userId, userId),
      with: {
        tasks: {
          where: and(
            eq(tasks.dueDate, date),
            eq(tasks.completed, true)
          ),
          orderBy: (tasks, { asc }) => [asc(tasks.completedAt)],
        },
      },
      orderBy: (taskGroups, { asc }) => [asc(taskGroups.createdAt)],
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
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

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
