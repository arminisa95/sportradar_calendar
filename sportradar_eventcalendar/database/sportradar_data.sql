-- phpMyAdmin SQL Dump
-- Database: `sportradar_data`
-- Exported: 2025-11-11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- -----------------------------
-- Table structure for `sport`
-- -----------------------------
CREATE TABLE `sport` (
  `sport_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`sport_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- -----------------------------
-- Table structure for `team`
-- -----------------------------
CREATE TABLE `team` (
  `team_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `sport_id` int(11) NOT NULL,
  PRIMARY KEY (`team_id`),
  KEY `fk_team__sport_id` (`sport_id`),
  CONSTRAINT `_team_sport_fk` FOREIGN KEY (`sport_id`) REFERENCES `sport` (`sport_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- -----------------------------
-- Table structure for `venue`
-- -----------------------------
CREATE TABLE `venue` (
  `venue_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `sport_id` int(11) NOT NULL,
  PRIMARY KEY (`venue_id`),
  CONSTRAINT `_venue_sport_fk` FOREIGN KEY (`sport_id`) REFERENCES `sport` (`sport_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- -----------------------------
-- Table structure for `event`
-- -----------------------------
CREATE TABLE `event` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `sport_id` int(11) NOT NULL,
  `home_team_id` int(11) NOT NULL,
  `away_team_id` int(11) NOT NULL,
  `venue_id` int(11) NOT NULL,
  `event_date` date NOT NULL,
  `event_time` time NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `idx_event_sport` (`sport_id`),
  KEY `idx_event_date_time` (`event_date`, `event_time`),
  KEY `fk_event__home_team` (`home_team_id`),
  KEY `fk_event__away_team` (`away_team_id`),
  KEY `fk_event__venue` (`venue_id`),
  CONSTRAINT `_event_sport_fk` FOREIGN KEY (`sport_id`) REFERENCES `sport` (`sport_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `_event_home_team_fk` FOREIGN KEY (`home_team_id`) REFERENCES `team` (`team_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `_event_away_team_fk` FOREIGN KEY (`away_team_id`) REFERENCES `team` (`team_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `_event_venue_fk` FOREIGN KEY (`venue_id`) REFERENCES `venue` (`venue_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- -----------------------------
-- Insert sample data
-- -----------------------------
INSERT INTO `sport` (`sport_id`, `name`) VALUES
(1, 'Football'),
(2, 'Ice Hockey'),
(3, 'Basketball'),
(4, 'Tennis');

INSERT INTO `team` (`team_id`, `name`, `sport_id`) VALUES
(1, 'Salzburg', 1),
(2, 'Sturm', 1),
(3, 'KAC', 2),
(4, 'Capitals', 2),
(5, 'Steelhawks Linz', 3),
(6, 'BC Vienna', 3),
(7, 'Serena Williams', 4),
(8, 'Roger Federer', 4);

INSERT INTO `venue` (`venue_id`, `name`, `city`, `country`, `sport_id`) VALUES
(1, 'Red Bull Arena', 'Salzburg', 'Austria', 1),
(2, 'Merkur Arena', 'Graz', 'Austria', 1),
(3, 'Klagenfurt Ice Dome', 'Klagenfurt', 'Austria', 2),
(4, 'Basketball Hall Linz', 'Linz', 'Austria', 3),
(5, 'Wimbledon', 'London', 'United Kingdom', 4);

INSERT INTO `event` (`event_id`, `sport_id`, `home_team_id`, `away_team_id`, `venue_id`, `event_date`, `event_time`, `description`) VALUES
(1, 1, 1, 2, 1, '2025-07-18', '18:30:00', 'Football: Salzburg vs Sturm'),
(2, 2, 3, 4, 3, '2025-10-23', '09:45:00', 'Ice Hockey: KAC vs Capitals');

COMMIT;