# Approach and Challenges

## Development Approach

I started by setting up the backend API first, then built the frontend to consume it. Used MongoDB for flexibility with user data and JWT for stateless authentication.

The project follows a standard MERN stack structure - Express routes handle API endpoints, React components manage the UI, and MongoDB stores user data. Authentication is handled through middleware that verifies JWT tokens before allowing access to protected routes.

For the admin panel, I implemented server-side pagination to handle large datasets efficiently. Search and filter functionality uses MongoDB regex queries for flexible matching.

## Challenges Faced

**Token Management:** Initially had issues with token refresh. Solved it by implementing axios interceptors that automatically refresh expired tokens.

**Image Upload:** Getting images to display correctly took some troubleshooting. The main issue was CORS blocking static file requests. Fixed by configuring Helmet's CSP and adding explicit CORS headers to the uploads route.

**Role-Based Access:** Ensuring regular users couldn't access admin routes required careful middleware implementation. Users can only view/edit their own profile unless they're admin.

**Pagination:** Implementing efficient pagination with search and filters required building dynamic MongoDB queries. Used skip/limit for pagination and regex for search functionality.

Overall, the project came together well. The main learning was around handling file uploads and ensuring proper CORS configuration for static assets.

