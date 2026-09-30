import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import ActiveTrends from './pages/ActiveTrends';
import TrendDetail from './pages/TrendDetail';
import { Archive } from './pages/Archive';
import { ScraperStatus } from './pages/ScraperStatus';
import Sources from './pages/Sources';
import { Team } from './pages/Team';
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
              <Nav />
              <ActiveTrends />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trends/:id"
          element={
            <ProtectedRoute>
              <TrendDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/archive"
          element={
            <ProtectedRoute>
              <Nav />
              <Archive />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scraper-status"
          element={
            <ProtectedRoute>
              <Nav />
              <ScraperStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sources"
          element={
            <ProtectedRoute>
              <Nav />
              <Sources />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <Nav />
              <Team />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/trends" />} />
      </Routes>
    </BrowserRouter>
  );
}
