-- Make college, department, year, and phoneNumber nullable for Google OAuth users
ALTER TABLE users
MODIFY COLUMN college VARCHAR(255) NULL,
MODIFY COLUMN department VARCHAR(255) NULL,
MODIFY COLUMN year VARCHAR(255) NULL,
MODIFY COLUMN phoneNumber VARCHAR(255) NULL;
