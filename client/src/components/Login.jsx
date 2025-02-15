import React from 'react';

const Login = () => {
  const handleLogin = () => {
    // Redirect to the backend endpoint that starts the Google OAuth flow
    window.location.href = 'http://localhost:3000/api/google/login';
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Login with Google</h1>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
};

export default Login;
