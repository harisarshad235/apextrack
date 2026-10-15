import { z } from 'zod';
import { sanitizePlainText, sanitizeMarkdown } from './sanitize';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid work email')
    .max(254, 'Email must be less than 254 characters')
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .transform(sanitizePlainText),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid work email')
    .max(254, 'Email must be less than 254 characters')
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters'),
  department: z
    .string()
    .max(100, 'Department must be less than 100 characters')
    .optional()
    .transform((val) => (val ? sanitizePlainText(val) : 'Engineering')),
});

export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid work email')
    .max(254, 'Email must be less than 254 characters')
    .transform((val) => val.toLowerCase().trim()),
});

export const passwordResetConfirmSchema = z.object({
  token: z
    .string()
    .min(10, 'Invalid token format')
    .max(1000, 'Token exceeds maximum length'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(128, 'Password must be less than 128 characters'),
});

export const createIssueSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must be less than 255 characters')
    .transform(sanitizePlainText),
  description: z
    .string()
    .max(20000, 'Description exceeds maximum allowed size')
    .optional()
    .transform((val) => (val ? sanitizeMarkdown(val) : '')),
  type: z.enum(['Story', 'Task', 'Bug', 'Epic', 'Subtask']).optional(),
  issueType: z.string().max(50).optional(),
  priority: z.enum(['Lowest', 'Low', 'Medium', 'High', 'Critical']).default('Medium'),
  status: z.string().max(50).optional().transform((val) => (val ? sanitizePlainText(val) : undefined)),
  projectId: z.string().max(100).optional(),
  parentIssueId: z.string().max(100).nullable().optional(),
  epicColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional(),
  assigneeId: z.string().max(100).nullable().optional(),
  sprintId: z.string().max(100).nullable().optional(),
  storyPoints: z.number().min(0).max(100).nullable().optional(),
  originalEstimateHours: z.number().min(0).max(1000).nullable().optional(),
  remainingEstimateHours: z.number().min(0).max(1000).nullable().optional(),
  dueDate: z.string().max(50).nullable().optional(),
  labelsList: z.array(z.string().max(50).transform(sanitizePlainText)).max(20).optional(),
});

export const updateIssueSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must be less than 255 characters')
    .transform(sanitizePlainText)
    .optional(),
  description: z
    .string()
    .max(20000, 'Description exceeds maximum allowed size')
    .transform(sanitizeMarkdown)
    .optional(),
  priority: z.enum(['Lowest', 'Low', 'Medium', 'High', 'Critical']).optional(),
  type: z.enum(['Story', 'Task', 'Bug', 'Epic', 'Subtask']).optional(),
  issueType: z.string().max(50).optional(),
  epicColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional(),
  status: z.string().max(50).transform(sanitizePlainText).optional(),
  projectId: z.string().max(100).optional(),
  parentIssueId: z.string().max(100).nullable().optional(),
  assigneeId: z.string().max(100).nullable().optional(),
  storyPoints: z.number().min(0).max(100).nullable().optional(),
  originalEstimateHours: z.number().min(0).max(1000).nullable().optional(),
  remainingEstimateHours: z.number().min(0).max(1000).nullable().optional(),
  sprintId: z.string().max(100).nullable().optional(),
  dueDate: z.string().max(50).nullable().optional(),
});

export const createCommentSchema = z.object({
  issueId: z
    .string()
    .min(1, 'Issue ID is required')
    .max(100)
    .transform(sanitizePlainText),
  body: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment exceeds maximum allowed length of 5000 characters')
    .transform(sanitizeMarkdown),
});

export const createDocumentSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must be less than 255 characters')
    .transform(sanitizePlainText),
  category: z
    .string()
    .max(100, 'Category must be less than 100 characters')
    .default('Architecture')
    .transform(sanitizePlainText),
  content: z
    .string()
    .min(1, 'Content cannot be empty')
    .max(50000, 'Document content exceeds maximum allowed size of 50,000 characters')
    .transform(sanitizeMarkdown),
});

export const updateDocumentSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must be less than 255 characters')
    .transform(sanitizePlainText)
    .optional(),
  category: z
    .string()
    .max(100, 'Category must be less than 100 characters')
    .transform(sanitizePlainText)
    .optional(),
  content: z
    .string()
    .min(1, 'Content cannot be empty')
    .max(50000, 'Document content exceeds maximum allowed size')
    .transform(sanitizeMarkdown)
    .optional(),
});

export const inviteUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .transform(sanitizePlainText),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Valid email required')
    .max(254, 'Email must be less than 254 characters')
    .transform((v) => v.toLowerCase().trim()),
  role: z.enum(['Admin', 'Member', 'Viewer']),
  department: z
    .string()
    .max(100, 'Department must be less than 100 characters')
    .optional()
    .transform((v) => (v ? sanitizePlainText(v) : 'Engineering')),
});
