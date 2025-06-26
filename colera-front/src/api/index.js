To create a new web application project with a login page that redirects to a dashboard for admin, manager, and doctor roles, follow these steps:

1. **Project Setup**:
   - Initialize a new project using a framework like Vue.js with Vite for fast development.
   - Install necessary dependencies for routing and state management (e.g., Vue Router and Vuex).

2. **Folder Structure**:
   - Organize your project with the following structure:
     - src/
       - components/
         - Login.vue
         - Dashboard.vue
       - views/
         - AdminDashboard.vue
         - ManagerDashboard.vue
         - DoctorDashboard.vue
       - store/
         - index.js
       - router/
         - index.js
       - App.vue
       - main.js

3. **Routing Configuration**:
   - Set up routing in `src/router/index.js` to handle navigation between the login page and the dashboards based on user roles.
   - Define routes for the login page and the respective dashboards.

4. **State Management**:
   - Use Vuex to manage user authentication state.
   - Create a store in `src/store/index.js` to handle user login, logout, and role management.

5. **Login Component**:
   - In `src/components/Login.vue`, create a form for user login.
   - Use the API endpoint POST /api/login to authenticate users.
   - On successful login, store the user token and role in the Vuex store and redirect to the appropriate dashboard.

6. **Dashboard Components**:
   - Create separate dashboard components for admin, manager, and doctor in `src/views/`.
   - Each dashboard can display relevant information based on the user's role.

7. **API Integration**:
   - Use Axios or Fetch API to make HTTP requests to the specified API endpoints.
   - Handle authentication by including the token in the headers for protected routes.

8. **Example Code Snippets**:

   - **Login.vue**:
     - Create a form with fields for email and password.
     - On form submission, call the login API and handle the response.

   - **Router Configuration**:
     - Define routes for the login and dashboard components.
     - Use navigation guards to protect routes based on user roles.

   - **Store Configuration**:
     - Create actions for login and logout.
     - Store user information and token in the state.

9. **Styling**:
   - Use CSS or a UI framework to style the login page and dashboards for a better user experience.

10. **Testing**:
    - Test the application to ensure that users can log in and are redirected to the correct dashboard based on their roles.

By following these steps, you will create a web application that allows users to log in and access different dashboards based on their roles, consuming the specified API for authentication and data retrieval.