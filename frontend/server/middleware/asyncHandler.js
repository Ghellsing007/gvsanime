// Async handler to avoid try-catch blocks in route handlers
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

