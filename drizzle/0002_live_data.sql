CREATE TABLE `trend_snapshots` (
	`feed_key` text PRIMARY KEY NOT NULL,
	`region` text,
	`payload` text,
	`attempted_at` text NOT NULL,
	`success_at` text,
	`status` integer NOT NULL,
	`note` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `flight_sessions` ADD `query_json` text;