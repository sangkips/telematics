import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Eye, EyeOff, Truck, AlertCircle } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Dashboard } from './components/Dashboard';
import { ResponsiveProvider } from './contexts/ResponsiveContext';
import { AlertSystemProvider } from './contexts/AlertSystemContext';
import { VehicleUpdateProvider, useVehicleUpdate } from './contexts/VehicleUpdateContext';
import { Vehicle } from './types';
import { apiService } from './services/api';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { LandingPage } from './components/LandingPage';

const LoginPage = () => {
  const { login, error: authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Login submitted', { email });
      const success = await login({ email, password });
      if (success) {
        // Navigate to dashboard on successful login
        navigate('/dashboard', { replace: true });
      } else {
        setError(authError || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = error || authError;

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden items-center justify-center p-12">
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-8 h-8 bg-gray-300 rotate-45 opacity-60" />
        <div className="absolute bottom-32 left-12 w-6 h-6 bg-gray-400 rotate-45 opacity-50" />
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-gray-300 rounded-full opacity-40" />

        <div className="text-center max-w-lg">
          {/* Image cards stack */}
          <div className="relative mb-8 flex justify-center h-72">
            <img
              src="/fleet_dashboard.png"
              alt="Fleet Dashboard"
              className="w-64 h-44 object-cover rounded-2xl shadow-lg transform -rotate-12 absolute top-4 left-1/4 -translate-x-1/2 border border-gray-200 transition-all duration-300 hover:scale-105 hover:-rotate-6 hover:shadow-xl cursor-pointer"
            />
            <img
              src="/vehicle_tracking.png"
              alt="Vehicle Tracking"
              className="w-64 h-44 object-cover rounded-2xl shadow-xl transform rotate-6 absolute top-12 right-1/4 translate-x-1/2 z-10 border border-gray-200 transition-all duration-300 hover:scale-105 hover:rotate-0 hover:shadow-2xl cursor-pointer"
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Manage your fleet with us
          </h2>
          <p className="text-gray-600">
            Access real-time tracking, fuel monitoring, and expert analytics for all your fleet management needs.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo - only visible on small screens */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Nura Logistics</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Login to Continue</h1>
            <p className="text-gray-600">Welcome back! Please enter your credentials to access your account.</p>
          </div>

          {/* Error Display */}
          {displayError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-600 text-sm">{displayError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <Input
                id="email"
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 pr-10 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-sm text-gray-600">Remember Me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                Recover Password?
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Login'
              )}
            </Button>

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account yet?{' '}
              <Link to="/" className="text-orange-500 hover:text-orange-600 font-medium">
                Signup!
              </Link>
            </p>
          </form>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
};


const AuthenticatedApp = () => {
  const { vehicles: vehicleMap, loading, error } = useVehicleUpdate();

  // Convert vehicle map to array for compatibility
  const vehicles = Object.values(vehicleMap);

  const handleVehicleUpdate = async (updatedVehicle: Vehicle) => {
    try {
      await apiService.updateVehicle(updatedVehicle.id, updatedVehicle);
      // The real-time hook will automatically fetch the updated data
    } catch (error) {
      console.error("Failed to update vehicle:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to connect to backend API</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Dashboard
        vehicles={vehicles}
        onVehicleUpdate={handleVehicleUpdate}
      />
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AuthenticatedApp />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ResponsiveProvider>
          <AlertSystemProvider>
            <VehicleUpdateProvider>
              <Routes>
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<AppContent />} />
                <Route path="/" element={<LandingPage />} />
              </Routes>
            </VehicleUpdateProvider>
          </AlertSystemProvider>
        </ResponsiveProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}