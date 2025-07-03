import jwt from "jsonwebtoken"
import { asyncHandler } from "./asyncHandler.js"
import User from "../models/User.js"
import ErrorResponse from "../utils/errorResponse.js"

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token

  // Check if auth header exists and starts with Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1]
  }
  // Check if token exists in cookies
  else if (req.cookies?.token) {
    token = req.cookies.token
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401))
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from the token
    req.user = await User.findById(decoded.id)

    if (!req.user) {
      return next(new ErrorResponse("User not found", 404))
    }

    next()
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401))
  }
})

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403))
    }
    next()
  }
}

// Check if user is verified
export const isVerified = asyncHandler(async (req, res, next) => {
  if (!req.user.emailVerified) {
    return next(new ErrorResponse("Email verification required to access this route", 403))
  }
  next()
})

