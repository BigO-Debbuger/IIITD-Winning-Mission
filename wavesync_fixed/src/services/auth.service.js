import api from './api'; // Assuming you have an Axios instance here

export const authService = {
  login: async (email, password) => {
    try {
      // Replace with your actual backend endpoint later
      // const response = await api.post('/auth/login', { email, password });
      // return response.data; 

      // MOCK IMPLEMENTATION FOR NOW (Remove when backend is ready)
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            token: "mock_jwt_token_12345",
            user: { id: "u1", name: "Ishita", role: "student" } // Try changing role to 'alumni'
          });
        }, 1000);
      });
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    // Add any backend logout logic here if needed (e.g., blacklisting tokens)
    return true;
  }
};