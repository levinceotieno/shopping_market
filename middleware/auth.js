function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/user/login');
}

function isAdmin(req, res, next) {
  if (req.session.isAdmin) {
    return next();
  }
  res.status(403).send('Access denied');
}

module.exports = { isAuthenticated, isAdmin };
