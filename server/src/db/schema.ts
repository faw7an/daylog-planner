import { pgTable, text, uuid, date, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().default(''),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  lastCarryDate: date('last_carry_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const taskGroups = pgTable('task_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  color: text('color').notNull().default('purple'),
  createdDate: date('created_date').notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').notNull().references(() => taskGroups.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  dueDate: date('due_date').notNull().defaultNow(),
  originalDate: date('original_date').notNull().defaultNow(),
  carried: boolean('carried').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  taskGroups: many(taskGroups),
  tasks: many(tasks),
}));

export const taskGroupsRelations = relations(taskGroups, ({ one, many }) => ({
  user: one(users, {
    fields: [taskGroups.userId],
    references: [users.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  taskGroup: one(taskGroups, {
    fields: [tasks.groupId],
    references: [taskGroups.id],
  }),
}));
