// ملف: middleware/admin.js
function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'ليس لديك الصلاحيات اللازمة.' });
    }
    next();
  }
  
  module.exports = isAdmin;
  