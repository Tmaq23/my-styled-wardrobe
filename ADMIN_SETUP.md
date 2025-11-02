# Admin System Setup Guide

## Overview
The admin system now supports both a master admin account and database-level admin users.

## Master Admin Account
- **Username**: `admin` (default, can be changed via `ADMIN_USERNAME` env variable)
- **Password**: `GodMode?2023` (set via `ADMIN_PASSWORD` env variable)
- This account is hardcoded and always has full admin access

## Database Admin Users
- Regular users in the database can be granted admin privileges
- Admin users can log in to the admin dashboard using their email and password
- Admin privileges can be toggled on/off through the admin dashboard

## Environment Variables
Make sure these are set in your `.env.local` file:

```env
# Master Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=GodMode?2023
```

## Admin Dashboard Features
1. **Username/Password Login** - Now requires both username and password
2. **Create Users** - Create regular users or admin users
3. **Toggle Admin Status** - Grant or remove admin privileges from existing users
4. **User Management** - Reset passwords, reset AI analysis trials, delete users
5. **Role Display** - Visual badges showing User vs Admin role

## How to Grant Admin Access

### Method 1: Create New Admin User
1. Go to `/admin` and log in
2. Click "+ Create User"
3. Fill in the user details
4. Check "Grant Admin Privileges"
5. Click "Create User"

### Method 2: Grant Admin to Existing User
1. Go to `/admin` and log in
2. Find the user in the list
3. Click "Make Admin" button next to their name
4. Confirm the action

### Method 3: Direct Database Update
Run this SQL on your Supabase database:
```sql
UPDATE users SET "isAdmin" = true WHERE email = 'user@example.com';
```

## Database Schema
The `users` table now includes an `isAdmin` boolean field:
- `isAdmin`: `false` by default for regular users
- `isAdmin`: `true` for admin users

## Security Notes
- Master admin credentials are stored in environment variables (never in database)
- Database admin users use bcrypt-hashed passwords
- Admin authentication checks both master account and database admins
- Only authenticated admins can access the admin dashboard

## Login Examples

### Master Admin Login
- Username: `admin`
- Password: `GodMode?2023`

### Database Admin Login
- Username: `user@example.com` (their email)
- Password: `their-user-password`
