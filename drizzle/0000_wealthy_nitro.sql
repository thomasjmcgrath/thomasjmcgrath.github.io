CREATE TABLE `source_checks` (
	`source_id` text PRIMARY KEY NOT NULL,
	`attempted_at` text NOT NULL,
	`success_at` text,
	`status` integer,
	`hash` text,
	`changed` integer DEFAULT 0 NOT NULL,
	`note` text NOT NULL,
	`reviewed_at` text,
	`reviewer` text
);
--> statement-breakpoint
CREATE TABLE `analytics_daily` (
	`date` text NOT NULL,
	`hippo_id` text NOT NULL,
	`metric` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`date`, `hippo_id`, `metric`)
);
--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`session` text NOT NULL,
	`hippo_id` text NOT NULL,
	`metric` text NOT NULL,
	`created_at` integer NOT NULL,
	`date` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `events_metric_date` ON `analytics_events` (`metric`,`date`);--> statement-breakpoint
CREATE INDEX `events_session_time` ON `analytics_events` (`session`,`created_at`);--> statement-breakpoint
CREATE TABLE `flight_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor` text NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `flight_expiry` ON `flight_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `venue_overrides` (
	`venue_id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`viewing` text NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`source_url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trend_points` (
	`hippo_id` text NOT NULL,
	`date` text NOT NULL,
	`region` text NOT NULL,
	`value` real NOT NULL,
	`source` text NOT NULL,
	`method` text NOT NULL,
	`imported_at` text NOT NULL,
	PRIMARY KEY(`hippo_id`, `date`, `region`)
);
