
## 🐜 How to Run  

1. Clone this repository.  
2. Install dependencies for both client and server.  
   ```bash
   cd client && pnpm install  
   cd ../server && npm install  
   ```   
4. Start the backend server:  
   ```bash
   cd server 
   npm run dev  # Starts the server
   ```  
5. Start the frontend:  
   ```bash
   cd client && pnpm run dev  # Start in development mode
   pnpm run build  # Build the project
   pnpm run preview  # Preview the build
   ```  
6. Open `http://localhost:5173` in development mode or `http://localhost:4173` after building for preview.  

7. Update environment variables: Both client and server contain an `env.example` file. Rename it to `.env` and add the required credentials before running the application.  

---  
