# Admin Dashboard Guide

## Overview
The admin dashboard provides comprehensive user management capabilities for My Styled Wardrobe.

## Accessing the Admin Dashboard

1. **URL**: Navigate to `http://localhost:3000/admin` (or your production URL + `/admin`)
2. **Authentication**: You'll be prompted for an admin password

## Setting Up Admin Password

Add the following to your `.env.local` file:

```env
ADMIN_PASSWORD=your-secure-password-here
```

**⚠️ IMPORTANT SECURITY NOTES:**
- Change the default password immediately!
- Use a strong, unique password
- Never commit the `.env.local` file to version control
- The default password is `admin123` (change this!)

## Admin Features

### 1. View All Users
- See a complete list of all registered users
- View user details:
  - Name
  - Email address
  - Account creation date
  - AI analysis usage count
  - Last activity timestamp

### 2. Search & Filter
- Search users by email or name
- Real-time filtering as you type

### 3. Reset Password
- Click "Reset Pass" button next to any user
- Enter a new password in the modal
- The password will be securely hashed before storing
- Minimum password length: 6 characters

### 4. Reset AI Analysis Trial
- Click "Reset Trial" button to reset a user's free AI analysis limit
- This allows users to get another free analysis
- Useful for:
  - Testing purposes
  - Customer service/goodwill gestures
  - Resolving user issues

### 5. Delete User
- Click "Delete" button to permanently remove a user
- ⚠️ **WARNING**: This action cannot be undone!
- All user data will be permanently deleted
- The demo account (`demo@mystyledwardrobe.com`) is protected and cannot be deleted

### 6. Refresh Data
- Click "Refresh" button to reload the user list
- Useful after making changes or to see new registrations

## User Activity Tracking

Currently, the system tracks:
- User registration date
- Last activity timestamp (updated whenever user data changes)
- AI analysis count (via localStorage)

### Future Enhancements
Consider adding:
- Login history
- Feature usage analytics
- Purchase history (when payment integration is added)
- Detailed activity logs

## Security Best Practices

1. **Password Management**
   - Set a strong admin password in `.env.local`
   - Change it regularly
   - Don't share it with unauthorized personnel

2. **Access Control**
   - Only access the admin dashboard from secure networks
   - Log out after use
   - Monitor for unauthorized access attempts

3. **Data Privacy**
   - Handle user data responsibly
   - Follow GDPR/data protection regulations
   - Only delete accounts when legally appropriate

4. **Environment Variables**
   - Never commit `.env.local` to Git
   - Use different passwords for dev/staging/production
   - Rotate credentials periodically

## Troubleshooting

### Cannot Access Admin Dashboard
- **Issue**: Invalid password error
- **Solution**: Check your `ADMIN_PASSWORD` in `.env.local`
- **Default**: If not set, defaults to `admin123`

### Users Not Loading
- **Issue**: Database connection error
- **Solution**: 
  - Check database connection in `.env.local`
  - Ensure Prisma schema is up to date: `npm run db:push`
  - Check network connectivity to database

### Password Reset Not Working
- **Issue**: Password reset fails
- **Solution**: 
  - Ensure new password meets minimum requirements (6 characters)
  - Check database write permissions
  - Verify user ID is valid

### Trial Reset Not Working
- **Issue**: Analysis count not resetting
- **Solution**: 
  - The analysis count is stored in browser localStorage
  - User needs to clear their browser cache/data
  - Or implement server-side tracking (future enhancement)

## API Endpoints

The admin dashboard uses these API endpoints:

1. **POST** `/api/admin/auth` - Authenticate admin access
2. **GET** `/api/admin/users` - Fetch all users
3. **POST** `/api/admin/reset-password` - Reset user password
4. **POST** `/api/admin/reset-trial` - Reset AI analysis trial
5. **DELETE** `/api/admin/delete-user` - Delete user account
6. **GET/POST** `/api/admin/user-activity` - Track/fetch user activity

## Future Enhancements

Potential features to add:
- [ ] Export user data to CSV
- [ ] Bulk operations (bulk delete, bulk reset trials)
- [ ] User messaging system
- [ ] Advanced analytics dashboard
- [ ] Audit log of admin actions
- [ ] Multiple admin roles (super admin, moderator, etc.)
- [ ] Email notifications to users (password reset, trial reset)
- [ ] Server-side analysis count tracking
- [ ] User session management
- [ ] Ban/suspend user functionality

## Support

For issues or questions about the admin dashboard:
1. Check this guide first
2. Review server logs for errors
3. Check database connectivity
4. Ensure all environment variables are set correctly

## Version History

- **v1.0** - Initial admin dashboard release
  - User listing
  - Password reset
  - Trial reset
  - User deletion
  - Search/filter functionality




