-- Triggers for users table

-- Email validation trigger
CREATE TRIGGER validate_email_before_insert
AFTER INSERT ON users
REFERENCING NEW TABLE AS newUser
FOR EACH ROW
SELECT CASE
    NEW.email NOT LIKE '%_@_%.__%' AND NEW.email IS NOT NULL
    ABORT 'Invalid email format';

CREATE TRIGGER validate_email_before_update
AFTER UPDATE OF email ON users
REFERENCING NEW TABLE AS newUser OLD TABLE AS oldUser
FOR EACH ROW
SELECT CASE
    NEW.email NOT LIKE '%_@_%.__%' AND NEW.email IS NOT NULL
    ABORT 'Invalid email format';

-- Age validation trigger
CREATE TRIGGER validate_age_before_insert
AFTER INSERT ON users
REFERENCING NEW TABLE AS newUser
FOR EACH ROW
SELECT CASE
    NEW.age < 0 OR NEW.age > 120 AND NEW.age IS NOT NULL
    ABORT 'Age must be between 0 and 120';

CREATE TRIGGER validate_age_before_update
AFTER UPDATE OF age ON users
REFERENCING NEW TABLE AS newUser OLD TABLE AS oldUser
FOR EACH ROW
SELECT CASE
    NEW.age < 0 OR NEW.age > 120 AND NEW.age IS NOT NULL
    ABORT 'Age must be between 0 and 120';

-- Username to lowercase trigger
CREATE TRIGGER username_to_lowercase_before_insert
AFTER INSERT ON users
REFERENCING NEW TABLE AS newUser
FOR EACH ROW
UPDATE users 
SET username = LOWER(NEW.username)
WHERE rowid = NEW.rowid;

CREATE TRIGGER username_to_lowercase_before_update
AFTER UPDATE OF username ON users
REFERENCING NEW TABLE AS newUser OLD TABLE AS oldUser
FOR EACH ROW
UPDATE users 
SET username = LOWER(NEW.username)
WHERE rowid = NEW.rowid; 