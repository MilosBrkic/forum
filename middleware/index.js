
function isLogged(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('error', 'Morate se prijaviti');
	res.redirect('/users/login');
};

module.exports = isLogged;