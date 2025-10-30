
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './src/context/AuthContext';
import App from './App';


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider> {/* <-- 2. ADD THIS WRAPPER LINE */}
      <App />
    </AuthProvider> {/* <-- 3. ADD THIS WRAPPER LINE */}
    
  </React.StrictMode>
);
