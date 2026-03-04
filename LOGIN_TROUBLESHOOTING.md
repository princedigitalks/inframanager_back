# Login Issue - Troubleshooting Guide

## Problem
401 Unauthorized error when trying to login with correct password.

## Possible Causes
1. User doesn't exist in database
2. User status is "inactive"
3. Password encryption mismatch
4. Wrong CRYPTO_SECRET in .env

## Solution Steps

### Step 1: Create Test User
```bash
cd new-crm-back
node createTestUser.js
```

This will create:
- Email: admin@test.com
- Password: admin123

### Step 2: Test Login Credentials
```bash
node testLogin.js admin@test.com admin123
```

This will show:
- If user exists
- Encrypted vs Decrypted password
- If password matches

### Step 3: Use These Credentials in Frontend
1. Go to: http://localhost:3001/login
2. Email: admin@test.com
3. Password: admin123
4. Click Sign In

## If Still Not Working

### Check Backend Server
```bash
cd new-crm-back
npm start
```
Should show: "Server running on port 5000"

### Check Frontend .env.local
File: `inframanager/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000/v1/api
```

### Check Backend .env
File: `new-crm-back/.env`
```
PORT=5000
CRYPTO_SECRET=my-super-secret-key-123
JWT_SECRET=another-super-secret-key-456
MONGO_URI=your-mongodb-uri
```

### Test API Directly
```bash
curl -X POST http://localhost:5000/v1/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

Should return:
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {...}
}
```

## Common Issues

### Issue 1: User not found
**Solution:** Run `node createTestUser.js`

### Issue 2: Password mismatch
**Solution:** 
- Run `node testLogin.js your@email.com yourpassword`
- Check if decrypted password matches

### Issue 3: Wrong port
**Solution:** 
- Backend should be on port 5000
- Frontend .env.local should point to port 5000

### Issue 4: CRYPTO_SECRET changed
**Solution:**
- If you changed CRYPTO_SECRET, old passwords won't decrypt
- Delete old users and create new ones
