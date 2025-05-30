// middleware/admin.js
export function isAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Access denied, admin only' });
  }
  next();
}