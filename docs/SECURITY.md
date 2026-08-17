# Security

- Passwords hashed with bcrypt (cost 12).  
- JWT in `Authorization` header, 14-day expiry, secret from `JWT_SECRET`.  
- Admin mutations check `user.role === 'ADMIN'` in use cases, not only in the UI.  
- Uploads: 2 MB, admin JWT required, stored in Mongo (not a world-writable disk).  
- Money is integer paise; payment success is confirmed server-side.  
- Do not commit `.env`. Render / Atlas credentials stay in the dashboard.

Production checklist: rotate `JWT_SECRET` and `ADMIN_PASSWORD`, restrict Atlas IP if you can, turn `SEED_DEMO=0` after you replace the sample catalog.
