To create a new web application project with a login page that redirects to a dashboard for admin, manager, and doctor roles, follow these steps:

1. **Project Setup**:
   - Initialize a new project using a framework like Vue.js or React.
   - Set up the project structure with folders for components, views, and services.

2. **Install Dependencies**:
   - Install necessary libraries for routing and state management (e.g., Vue Router, Vuex for Vue.js or React Router, Redux for React).
   - Install Axios or Fetch API for making HTTP requests.

3. **Create the Login Page**:
   - Create a `Login.vue` or `Login.js` component.
   - Design the login form with fields for email and password.
   - Add a submit button that triggers a login function.

4. **Implement Login Functionality**:
   - In the login function, capture the input values and make a POST request to the `/api/login` endpoint.
   - Handle the response to check if the login is successful.
   - If successful, store the received JWT token in local storage or a state management store.

5. **Redirect Based on Role**:
   - After a successful login, check the user role (admin, manager, or doctor) from the response or by decoding the JWT token.
   - Use the router to redirect to the appropriate dashboard based on the role:
     - Admin: Redirect to `/admin-dashboard`
     - Manager: Redirect to `/manager-dashboard`
     - Doctor: Redirect to `/doctor-dashboard`

6. **Create Dashboard Components**:
   - Create separate components for each dashboard (e.g., `AdminDashboard.vue`, `ManagerDashboard.vue`, `DoctorDashboard.vue`).
   - Design the layout and include relevant information or functionalities for each role.

7. **Set Up Routing**:
   - Configure the router to define routes for the login page and each dashboard.
   - Ensure that routes are protected, requiring authentication to access the dashboards.

8. **Handle Authentication State**:
   - Implement a mechanism to check if the user is authenticated (e.g., checking for a valid token in local storage).
   - Redirect to the login page if the user tries to access a dashboard without being authenticated.

9. **Testing**:
   - Test the application by attempting to log in with different user roles.
   - Ensure that the redirection works correctly and that each dashboard displays the appropriate content.

10. **Deployment**:
   - Once tested, prepare the application for deployment by building the project.
   - Deploy to a web server or hosting service.

By following these steps, you will create a web application with a login page that redirects users to their respective dashboards based on their roles, consuming the specified API for authentication.