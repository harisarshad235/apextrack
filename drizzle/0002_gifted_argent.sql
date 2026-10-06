CREATE TABLE `issue_links` (
	`id` text PRIMARY KEY NOT NULL,
	`source_issue_id` text NOT NULL,
	`target_issue_id` text NOT NULL,
	`relation_type` text DEFAULT 'relates_to' NOT NULL,
	FOREIGN KEY (`source_issue_id`) REFERENCES `issues`(`key`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`target_issue_id`) REFERENCES `issues`(`key`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `issue_links_source_idx` ON `issue_links` (`source_issue_id`);--> statement-breakpoint
CREATE INDEX `issue_links_target_idx` ON `issue_links` (`target_issue_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`author_id` text,
	`issue_id` text,
	`message` text NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`key`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`user_id`,`read`);--> statement-breakpoint
CREATE TABLE `subtasks` (
	`id` text PRIMARY KEY NOT NULL,
	`issue_id` text NOT NULL,
	`title` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`key`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `subtasks_issue_idx` ON `subtasks` (`issue_id`);--> statement-breakpoint
ALTER TABLE `issues` ADD `is_flagged` integer DEFAULT false NOT NULL;