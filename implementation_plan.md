# Implementation Plan - Admin Page & Panel

This plan outlines the steps required to implement a robust, high-performance, and visually stunning Admin page for FinSight AI. The admin panel will allow administrators to view application statistics, manage user details, change user roles, delete accounts (along with associated data to maintain database integrity), and monitor system health.

## User Review Required

> [!WARNING]
> Database integrity: Deleting a user will trigger cascade deletion of their transactions, budgets, and subscriptions. This action is irreversible. We will add a double-confirmation modal on the frontend to prevent accidental deletions.

> [!NOTE]
> We will seed an administrator account (`admin@finsight.com` / `adminpassword123`) to make testing and validation easy.

## Proposed Changes

### Backend Changes

To support the admin functionality, we will modify the User model, secure the admin routes using role-based middleware, and provide endpoints for dashboard statistics and user administration.

---

#### [MODIFY] [User.js](file:///d:/GitProjects/Finsight-Al/backend/src/models/User.js)
- Add `role` field to the schema:
  ```javascript
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  }
  ```

#### [MODIFY] [authController.js](file:///d:/GitProjects/Finsight-Al/backend/src/controllers/authController.js)
- Update responses for `registerUser`, `loginUser`, and `getUserProfile` to include the `role` in the returned JSON.

#### [MODIFY] [authMiddleware.js](file:///d:/GitProjects/Finsight-Al/backend/src/middleware/authMiddleware.js)
- Add and export an `admin` middleware:
  ```javascript
  const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized as an admin' });
    }
  };
  ```

#### [NEW] [adminRoutes.js](file:///d:/GitProjects/Finsight-Al/backend/src/routes/adminRoutes.js)
- Define admin endpoints:
  - `GET /api/admin/stats` - Returns aggregate statistics (total users, total transactions, total budgets, transaction volume, recent users) and backend system/health telemetry.
  - `GET /api/admin/users` - Returns a list of all registered users (excluding passwords).
  - `PUT /api/admin/users/:id/role` - Allows updating a user's role (toggles admin/user status).
  - `DELETE /api/admin/users/:id` - Deletes a user and cascades deletion to their transactions, budgets, and subscriptions.

#### [MODIFY] [server.js](file:///d:/GitProjects/Finsight-Al/backend/src/server.js)
- Mount `adminRoutes` at `/api/admin`.

#### [MODIFY] [seed.js](file:///d:/GitProjects/Finsight-Al/backend/seed.js)
- Update the seed script to create a default administrator user (`admin@finsight.com` with password `adminpassword123`).

---

### Frontend Changes

We will capture the user's role in the Authentication context, conditionally render the Admin link in the sidebar, and implement a dedicated Admin panel.

---

#### [MODIFY] [AuthContext.jsx](file:///d:/GitProjects/Finsight-Al/frontend/src/context/AuthContext.jsx)
- Update register/login functions to extract the `role` from the response payload and store it in `finsight_session` inside `localStorage`.

#### [MODIFY] [DashboardLayout.jsx](file:///d:/GitProjects/Finsight-Al/frontend/src/layouts/DashboardLayout.jsx)
- Conditionally append an **Admin Panel** link to `navItems` if the authenticated user has the `admin` role.
- Register the page title and description for `/dashboard/admin`.

#### [MODIFY] [App.jsx](file:///d:/GitProjects/Finsight-Al/frontend/src/App.jsx)
- Define a new `AdminRoute` component that redirects unauthorized users to `/dashboard`.
- Mount the new `/dashboard/admin` route.

#### [NEW] [Admin.jsx](file:///d:/GitProjects/Finsight-Al/frontend/src/pages/Admin.jsx)
- Develop the Admin Dashboard component using a clean, modern design system conforming to the existing dark mode features.
- **Sections**:
  - **Metrics Dashboard**: Display cards for total users, transactions volume, and system statistics with smooth gradients and hover effects.
  - **System Health Monitor**: Visual display of backend parameters (uptime, memory utilization, Node.js version).
  - **User Management Console**: Table displaying users with search/filter, a role change toggle, and delete actions with confirmation dialogs.

---

## Verification Plan

### Automated Tests
- Since we have a backend Express server, we can verify endpoints by starting the server and making test HTTP requests.
- Validate that regular users are rejected with `403 Forbidden` on `/api/admin/*` endpoints.
- Validate that admins can fetch statistics and modify users.

### Manual Verification
1. Run `node seed.js` in the `backend` directory to initialize the database with both user and admin profiles.
2. Open the web interface, sign in as `admin@finsight.com` / `adminpassword123`.
3. Confirm the presence of the "Admin Panel" in the sidebar navigation.
4. Interact with the Admin panel:
   - Perform user search.
   - Toggle a user's role and verify changes.
   - Delete a test user and verify cascading deletion of associated budgets/transactions.
   - Switch theme between Light/Dark mode and ensure visual consistency.
