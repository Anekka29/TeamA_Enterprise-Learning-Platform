
-- Set safe default values for columns that might not have data for Google OAuth users
-- This ensures no NULL constraints are violated

ALTER TABLE users 
MODIFY COLUMN college VARCHAR(255) DEFAULT 'Not Provided',
MODIFY COLUMN department VARCHAR(255) DEFAULT 'Not Provided',
MODIFY COLUMN year VARCHAR(255) DEFAULT 'Not Provided',
MODIFY COLUMN phoneNumber VARCHAR(255) DEFAULT '';

-- Update existing NULL values to use the new defaults
UPDATE users 
SET college = 'Not Provided' 
WHERE college IS NULL;

UPDATE users 
SET department = 'Not Provided' 
WHERE department IS NULL;

UPDATE users 
SET year = 'Not Provided' 
WHERE year IS NULL;

UPDATE users 
SET phoneNumber = '' 
WHERE phoneNumber IS NULL;

