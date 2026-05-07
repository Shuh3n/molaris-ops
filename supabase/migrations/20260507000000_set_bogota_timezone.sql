-- Set default timezone for the database to Bogotá
ALTER DATABASE postgres SET timezone TO 'America/Bogota';

-- Update current session to apply immediately
SET timezone TO 'America/Bogota';
