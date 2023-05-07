function errorHandler(err, req, res, next) {
	if (err.name === "UnauthorizedError") {
		return res.status(401).json({ message: "the user is not authorized" });
	}
	if (err.name === "ValidationError") {
		return res.status(401).json({ message: err });
	}
	return res.status(400).json({ err: err });
}

module.exports = errorHandler;
