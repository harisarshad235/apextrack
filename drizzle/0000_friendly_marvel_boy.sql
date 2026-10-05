CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`issue_key` text,
	`document_id` text,
	`file_name` text NOT NULL,
	`content_type` text DEFAULT 'application/octet-stream' NOT NULL,
	`size_bytes` integer NOT NULL,
	`r2_key` text NOT NULL,
	`uploaded_by_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`issue_key`) REFERENCES `issues`(`key`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`uploaded_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "attachments_owner_ck" CHECK(("attachments"."issue_key" IS NOT NULL AND "attachments"."document_id" IS NULL) OR ("attachments"."issue_key" IS NULL AND "attachments"."document_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attachments_r2key_uq` ON `attachments` (`r2_key`);--> statement-breakpoint
CREATE INDEX `attachments_issue_idx` ON `attachments` (`issue_key`);--> statement-breakpoint
CREATE INDEX `attachments_doc_idx` ON `attachments` (`document_id`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`issue_key` text NOT NULL,
	`author_id` text,
	`body` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`issue_key`) REFERENCES `issues`(`key`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `comments_issue_idx` ON `comments` (`issue_key`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`category` text DEFAULT 'Architecture' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`author_id` text,
	`updated_by_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`updated_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `documents_category_idx` ON `documents` (`category`);--> statement-breakpoint
CREATE TABLE `issue_history` (
	`id` text PRIMARY KEY NOT NULL,
	`issue_key` text NOT NULL,
	`actor_id` text,
	`actor_name` text NOT NULL,
	`action` text NOT NULL,
	`field` text,
	`from_value` text,
	`to_value` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`issue_key`) REFERENCES `issues`(`key`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `history_issue_idx` ON `issue_history` (`issue_key`);--> statement-breakpoint
CREATE TABLE `issue_labels` (
	`issue_key` text NOT NULL,
	`label_id` integer NOT NULL,
	PRIMARY KEY(`issue_key`, `label_id`),
	FOREIGN KEY (`issue_key`) REFERENCES `issues`(`key`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`label_id`) REFERENCES `labels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `issues` (
	`key` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`type` text DEFAULT 'Task' NOT NULL,
	`priority` text DEFAULT 'Medium' NOT NULL,
	`status` text DEFAULT 'To Do' NOT NULL,
	`assignee_id` text,
	`reporter_id` text,
	`sprint_id` text,
	`story_points` integer DEFAULT 0 NOT NULL,
	`due_date` text,
	`rank` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`sprint_id`) REFERENCES `sprints`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "issues_points_ck" CHECK("issues"."story_points" >= 0 AND "issues"."story_points" <= 100)
);
--> statement-breakpoint
CREATE INDEX `issues_status_idx` ON `issues` (`status`);--> statement-breakpoint
CREATE INDEX `issues_assignee_idx` ON `issues` (`assignee_id`);--> statement-breakpoint
CREATE INDEX `issues_sprint_idx` ON `issues` (`sprint_id`);--> statement-breakpoint
CREATE TABLE `labels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `labels_name_uq` ON `labels` (`name`);--> statement-breakpoint
CREATE TABLE `project_counters` (
	`project_key` text PRIMARY KEY NOT NULL,
	`next_seq` integer DEFAULT 101 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sprints` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`state` text DEFAULT 'upcoming' NOT NULL,
	`goal` text,
	`start_date` text,
	`end_date` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sprints_state_idx` ON `sprints` (`state`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'Viewer' NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`department` text,
	`avatar_url` text,
	`approved_by_id` text,
	`approved_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_uq` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_status_idx` ON `users` (`status`);