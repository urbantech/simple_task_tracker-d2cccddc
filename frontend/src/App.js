import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AINativeProvider } from '@ainative/react-sdk';
import TaskCreation from './components/TaskCreation';
import TaskListing from './components/TaskListing';
import TaskCompletion from './components/TaskCompletion';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('ainative_token');
        if (token) {
          // Optionally, verify token here or fetch user data
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuthStatus();
  }, []);

  const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAINativeAuth();

    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const response = await login({ email, password });
        localStorage.setItem('ainative_token', response.access_token);
      } catch (err) {
        setError(err.message);
      }
    };

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form onSubmit={handleLogin} className="p-6 max-w-sm w-full bg-white rounded-lg shadow-md space-y-4">
          <h2 className="text-2xl font-bold text-center">Login</h2>
          {error && <p className="text-red-500">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:border-blue-500 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:border-blue-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
          >
            Login
          </button>
        </form>
      </div>
    );
  };

  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('ainative_token');
    if (!token) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  const LogoutButton = () => {
    const handleLogout = () => {
      localStorage.removeItem('ainative_token');
    };
    return (
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-200"
      >
        Logout
      </button>
    );
  };

  if (!authChecked) return null;

  return (
    <AINativeProvider apiKey={process.env.REACT_APP_AINATIVE_API_KEY || ''}>
      <Router>
        <header className="bg-dark-navy text-white p-4 flex justify-between items-center">
          <div className="font-bold text-xl">Simple Task Tracker</div>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link to="/" className="hover:text-blue-300">Home</Link>
              </li>
              <li>
                <Link to="/tasks/create" className="hover:text-blue-300">Create Task</Link>
              </li>
              <li>
                <Link to="/tasks/list" className="hover:text-blue-300">List Tasks</Link>
              </li>
              <li>
                <Link to="/tasks/complete" className="hover:text-blue-300">Complete Tasks</Link>
              </li>
              <li>
                <LogoutButton />
              </li>
            </ul>
          </nav>
        </header>
        <main className="p-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <TaskListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/create"
              element={
                <ProtectedRoute>
                  <TaskCreation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/list"
              element={
                <ProtectedRoute>
                  <TaskListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/complete"
              element={
                <ProtectedRoute>
                  <TaskCompletion />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </Router>
    </AINativeProvider>
  );
};

export default App;