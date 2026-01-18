module.exports = function allowRoles(...roles) {
    const allowed = (roles || []).map(r => String(r).toLowerCase());

    return (req, res, next) => {
        // `verifyToken` middleware (auth.js) should set req.user
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // If no roles provided, allow any authenticated user
        if (allowed.length === 0) {
            return next();
        }

        const userRole = String(req.user.role || '').toLowerCase();
        if (!allowed.includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    };
};
