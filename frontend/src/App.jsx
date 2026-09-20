import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { ActiveTrends } from './pages/ActiveTrends';
import { Archive } from './pages/Archive';
import { ScraperStatus } from './pages/ScraperStatus';
import { Sources } from './pages/Sources';
import { Nav } from './components/Nav';
import { ToastContainer } from './components/Toast';
import { getToken } from './api';

const ProtectedRoute = ({ children }) => {
  return getToken() ? children : <Navigate to="/login" />;
};

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (token) setUser('Editor');
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/trends" 
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50">
                <Nav user={user} />
                <div className="max-w-7xl mx-auto px-8 py-12">
                  <ActiveTrends />
                </div>
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/archive" 
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50">
                <Nav user={user} />
                <div className="max-w-7xl mx-auto px-8 py-12">
                  <Archive />
                </div>
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/scraper-status" 
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50">
                <Nav user={user} />
                <ScraperStatus />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sources" 
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50">
                <Nav user={user} />
                <Sources />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/trends" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
