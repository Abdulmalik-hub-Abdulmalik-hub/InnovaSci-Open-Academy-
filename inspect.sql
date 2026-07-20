-- Check all users in the users table
SELECT id, email, role, status, "emailVerified", "createdAt" 
FROM users;

-- Check if specific user exists
SELECT id, email, role, status, "emailVerified", "createdAt" 
FROM users 
WHERE email = 'abdulmalikmusba@gmail.com';
