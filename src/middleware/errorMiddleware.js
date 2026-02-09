const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  const errorResponse = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  if (err.name === 'ValidationError') {
    errorResponse.message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    return res.status(400).json(errorResponse);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    errorResponse.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    return res.status(400).json(errorResponse);
  }

  if (err.name === 'CastError') {
    errorResponse.message = 'Invalid ID format';
    return res.status(400).json(errorResponse);
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = { notFound, errorHandler };
