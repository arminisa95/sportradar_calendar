# Sports Event Calendar

This is a small web app I made for the Sportradar Coding Academy exercise. It shows sports events and lets you add/update/delete them. I tried to keep it simple and userfriendly.

## What’s inside

- Frontend: HTML, Bootstrap 5, a bit of CSS, and plain JS (no frameworks).
- Backend: PHP files that talk to MySQL.
- Database: MySQL schema file with some sample data.

## How to run (local, with XAMPP)

1. Copy the project folder to your web root.
   - For me it is: `C:\xampp\htdocs\sports_api`
   - App URL: `http://localhost/sports_api/sportradar_eventcalendar/`
2. Start Apache and MySQL in XAMPP.
3. Create the database and import the SQL:
   - Open phpMyAdmin → create database `sportradar_data` (utf8mb4).
   - Import `sportradar_eventcalendar/database/sportradar_data.sql`
4. If your DB user/pass is different, change them in:
   - `sportradar_eventcalendar/api/db_connect.php`
   - It also supports environment variables `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`.

Now refresh the app URL and you should see events.

## Features I added

- List events with sport, teams, venue, date and time.
- Filter by sport and by date.
- Add new event (offcanvas form on the right).
- Edit and delete existing events.
- Small toasts for messages and a confirm modal for delete.

## API endpoints (relative to `/sportradar_eventcalendar/api`)

- GET `get_sports.php`
- GET `get_teams.php`
- GET `get_venues.php`
- GET `get_events.php`
- GET `get_event.php?event_id=1`
- POST `create_event.php` (JSON body)
- POST `update_event.php` (JSON body)
- POST `delete_event.php` (JSON body)

All return JSON. I tried to validate date/time and IDs, and avoid running SQL in loops.

## Database design (short)

Tables: `sport`, `team`, `venue`, `event`  
- PKs: `sport_id`, `team_id`, `venue_id`, `event_id`  
- FKs: `_team_sport_fk`, `_venue_sport_fk`, `_event_sport_fk`, `_event_home_team_fk`, `_event_away_team_fk`, `_event_venue_fk`  
- Index on `event(event_date, event_time)` for sorting/filtering.

Sample data includes football, ice hockey, basketball, tennis examples.