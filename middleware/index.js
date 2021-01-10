
function isLogged(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('error', 'You need to be logged in');
	res.redirect('/users/login');
};

module.exports = isLogged;