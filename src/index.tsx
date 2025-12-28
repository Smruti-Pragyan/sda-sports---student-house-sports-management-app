import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './src/context/AuthContext';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary'; // <-- Import it

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary> {/* <-- Wrap everything with ErrorBoundary */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);