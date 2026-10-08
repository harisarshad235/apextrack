-- Phase 1 Enterprise Jira Upgrade Migration
ALTER TABLE `issues` ADD `parent_issue_id` text REFERENCES issues(key) ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE `issues` ADD `issue_type` text DEFAULT 'TASK' NOT NULL;
--> statement-breakpoint
ALTER TABLE `issues` ADD `epic_color` text DEFAULT '#3B82F6';
--> statement-breakpoint
ALTER TABLE `issues` ADD `original_estimate_hours` real;
--> statement-breakpoint
ALTER TABLE `issues` ADD `remaining_estimate_hours` real;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_issues_parent` ON `issues` (`parent_issue_id`);
--> statement-breakpoint
ALTER TABLE `issue_links` ADD `link_type` text DEFAULT 'RELATES_TO' NOT NULL;
--> statement-breakpoint
ALTER TABLE `issue_links` ADD `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `idx_issue_links_source_target_type_uq` ON `issue_links` (`source_issue_id`, `target_issue_id`, `link_type`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `issue_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`issue_id` text NOT NULL,
	`author_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`key`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_comments_issue` ON `issue_comments` (`issue_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `issue_audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`issue_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`field_changed` text NOT NULL,
	`old_value` text,
	`new_value` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`key`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_audit_issue` ON `issue_audit_logs` (`issue_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `project_workflow_statuses` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'TODO' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`wip_limit` integer DEFAULT 0 NOT NULL,
	`is_initial` integer DEFAULT false NOT NULL,
	`is_final` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_workflow_project` ON `project_workflow_statuses` (`project_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `workflow_transition_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`from_status_id` text,
	`to_status_id` text NOT NULL,
	`require_assignee` integer DEFAULT false NOT NULL,
	`require_all_subtasks_complete` integer DEFAULT false NOT NULL,
	`require_resolution_comment` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_transition_rules_project` ON `workflow_transition_rules` (`project_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `issue_git_links` (
	`id` text PRIMARY KEY NOT NULL,
	`issue_id` text NOT NULL,
	`provider` text DEFAULT 'GITHUB' NOT NULL,
	`repo_full_name` text NOT NULL,
	`ref_type` text NOT NULL,
	`ref_name` text NOT NULL,
	`url` text NOT NULL,
	`status` text DEFAULT 'OPEN',
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`key`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_git_links_issue` ON `issue_git_links` (`issue_id`);
