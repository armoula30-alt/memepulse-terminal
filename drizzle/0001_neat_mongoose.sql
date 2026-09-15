CREATE TABLE `market_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenAddress` varchar(64) NOT NULL,
	`observedAt` timestamp NOT NULL,
	`priceUsd` double,
	`liquidityUsd` double NOT NULL,
	`volume1hUsd` double NOT NULL,
	`change1hPct` double NOT NULL,
	`buys1h` int NOT NULL,
	`sells1h` int NOT NULL,
	CONSTRAINT `market_snapshots_id` PRIMARY KEY(`id`)
);
