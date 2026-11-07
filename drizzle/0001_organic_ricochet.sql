CREATE TABLE `news_checks` (
	`source_id` text PRIMARY KEY NOT NULL,
	`attempted_at` text NOT NULL,
	`success_at` text,
	`status` integer NOT NULL,
	`matched` integer DEFAULT 0 NOT NULL,
	`note` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `news_items` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`first_seen_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`hidden` integer DEFAULT 0 NOT NULL,
	`review_required` integer DEFAULT 0 NOT NULL,
	`pending_payload` text
);
