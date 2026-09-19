import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Toast } from '../components/Toast';
import { login } from '../api';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email';
    if (!password) newErrors.password = 'Password required';
    else if (password.length < 6) newErrors.password = 'Minimum 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        Toast.success('Logged in successfully');
        navigate('/trends');
      }
    } catch (error) {
      Toast.error('Invalid credentials');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setEmail('demo@broadway.trends');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-12 max-w-md w-full">
        <h1 className="text-32 font-bold text-gray-900 mb-2">Broadway</h1>
        <p className="text-14 text-gray-700 mb-8">Cultural Intelligence Dashboard</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Email" 
            type="email" 
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input 
            label="Password" 
            type="password"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <Button type="submit" variant="primary" size="md" loading={loading} className="w-full">
            Login
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-12 text-gray-700 mb-2">Demo Account:</p>
          <Button onClick={handleDemo} variant="secondary" size="sm" className="w-full">
            Use Demo Account
          </Button>
        </div>
      </div>
    </div>
  );
};
