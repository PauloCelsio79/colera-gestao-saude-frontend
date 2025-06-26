To create a new web application project with a login page that redirects to a dashboard for admin, manager, and doctor roles, follow these steps:

1. **Set Up Project Structure**:
   - Create a new project folder.
   - Inside the project folder, create the following structure:
     - src/
       - components/
         - Login.vue
         - Dashboard.vue
       - App.vue
       - main.js
     - public/
       - index.html
     - package.json
     - vite.config.js

2. **Install Dependencies**:
   - Use a package manager to install Vue and any necessary libraries for routing and HTTP requests (like Axios).

3. **Configure Vite**:
   - In vite.config.js, ensure you have the necessary configurations for Vue.

4. **Create the HTML Template**:
   - In public/index.html, set up the basic HTML structure with a div for the Vue app.

5. **Set Up Main Application**:
   - In src/main.js, import Vue, the App component, and mount it to the HTML.

6. **Create the Login Component**:
   - In src/components/Login.vue:
     - Create a form with fields for email and password.
     - On form submission, make a POST request to the /api/login endpoint.
     - If successful, store the JWT token and redirect to the dashboard based on the user role.

7. **Create the Dashboard Component**:
   - In src/components/Dashboard.vue:
     - Check the user role from the stored token.
     - Display different content based on whether the user is an admin, manager, or doctor.

8. **Implement Routing**:
   - Use a routing library to handle navigation between the login page and the dashboard.
   - Set up routes for the login and dashboard components.

9. **Handle Authentication**:
   - Create a service to manage authentication, including storing and retrieving the JWT token.
   - Implement logic to check if the user is authenticated before accessing the dashboard.

10. **Style the Application**:
    - Use CSS to style the login form and dashboard for a better user experience.

11. **Test the Application**:
    - Run the application and test the login functionality with different user roles to ensure proper redirection and access control.

By following these steps, you will create a web application that allows users to log in and be redirected to their respective dashboards based on their roles, consuming the specified API for authentication.