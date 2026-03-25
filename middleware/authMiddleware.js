const jwt = require('jsonwebtoken');

// Protect Route - Check if User is Logged In
// This middleware first tries to validate the JWT cookie. If that fails but
// a valid session exists, it will fall back to the session-based user id so
// previously-logged-in users aren’t bounced back to the login page when the
// JWT is missing or expired (e.g. after a server restart).
exports.protect = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            return next();
        } catch {
            // token invalid/expired – clear it and continue to session fallback
            res.clearCookie('token');
        }
    }

    // fallback: session-based authentication
    if (req.session && req.session.userId) {
        req.user = { id: req.session.userId };
        return next();
    }

    // no valid auth at all
    return res.redirect('/login');
};

// Admin Only - Check if User is Admin
exports.adminOnly = (req, res, next) => {
    if (req.user.role !== 'Admin') return res.redirect('/dashboard');
    next();
};
