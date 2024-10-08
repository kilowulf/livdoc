/**
 * Authentication Middleware Configuration:
 * This file configures middleware to enforce authentication on specific routes within the application.
 * It uses Kinde's auth middleware to handle authentication, ensuring only authenticated users can
 * access protected routes. The middleware is applied to the specified routes based on the matcher pattern.
 */

import { authMiddleware } from "@kinde-oss/kinde-auth-nextjs/server"; // Middleware to handle authentication

// Config object to specify which routes require authentication.
export const config = {
  // Matcher pattern to apply the auth middleware to the dashboard routes and the auth-callback route.
  matcher: ["/dashboard/:path*", "/auth-callback"]
};

// Export the configured authentication middleware as default.
export default authMiddleware;
