function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(error, _req, res, _next) {
  if (error.name === "ValidationError") {
    const details = Object.values(error.errors).map((item) => ({ field: item.path, message: item.message }));
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Please check the submitted fields.", details } });
  }
  if (error.code === 11000) {
    return res.status(409).json({ success: false, error: { code: "DUPLICATE_VALUE", message: "An account with this email already exists." } });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "The supplied ID is not valid." } });
  }
  if (error.message === "Origin is not allowed by CORS") {
    return res.status(403).json({ success: false, error: { code: "CORS_BLOCKED", message: error.message } });
  }
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  return res.status(status).json({
    success: false,
    error: { code: error.code || "SERVER_ERROR", message: status >= 500 ? "Something went wrong on the server." : error.message }
  });
}

module.exports = { notFound, errorHandler };
