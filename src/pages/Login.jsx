import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, AlertCircle, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { seedAll, reseedStudents } from '../services/seedFirestore';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [seedStatus, setSeedStatus] = useState('');
  const [studentSeedStatus, setStudentSeedStatus] = useState('');

  const handleSeed = async () => {
    setSeedStatus('seeding');
    try {
      await seedAll();
      setSeedStatus('done');
    } catch (e) {
      setSeedStatus('error');
      console.error(e);
    }
  };

  const handleReseedStudents = async () => {
    setStudentSeedStatus('seeding');
    try {
      await reseedStudents();
      setStudentSeedStatus('done');
    } catch (e) {
      setStudentSeedStatus('error');
      console.error(e);
    }
  };
  const quickLogins = [
    { label: 'College Faculty (Juned)', email: 'juned@cumail.in', password: 'Juned@FS2024' },
    { label: 'College Admin', email: 'admin.college@cumail.in', password: 'CU@Admin2024' },
    { label: 'School Faculty', email: 'sharma.math@dps.edu', password: 'Sharma@Math2024' },
    { label: 'School Admin', email: 'admin.school@dps.edu', password: 'School@2024' },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setError('');
    setLoading(true);

    try {
      const result = await login(quickEmail, quickPassword);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-[#1E3A8A]">
          <BrainCircuit size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to AttendAI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Smart Attendance System for Schools & Universities
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors" 
                  placeholder="your.email@institution.edu" 
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors" 
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full py-2.5"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Access Portal'}
            </Button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-[#1E3A8A] hover:text-blue-900 font-medium"
                onClick={() => alert('Password reset functionality coming soon!')}
              >
                Forgot your password?
              </button>
            </div>
          </form>

          {/* Quick Login Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Quick Login (Testing)</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {quickLogins.map((quick, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickLogin(quick.email, quick.password)}
                  disabled={loading}
                  className="px-3 py-2 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {quick.label}
                </button>
              ))}
            </div>
            
            <p className="mt-3 text-xs text-center text-gray-500">
              Click any button above for instant login
            </p>
          </div>
        </Card>

        {/* Credentials Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            For all credentials, see{' '}
            <a 
              href="https://github.com/yourusername/attendai/blob/main/LOGIN_TESTING_GUIDE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#1E3A8A] hover:text-blue-900 font-medium"
            >
              LOGIN_TESTING_GUIDE.md
            </a>
          </p>
        </div>

        {/* One-time DB Seed */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-xs text-yellow-800 mb-2 font-medium">First time setup — seed the database once</p>
          <div className="flex flex-col gap-2 items-center">
            <button
              onClick={handleSeed}
              disabled={seedStatus === 'seeding' || seedStatus === 'done'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Database size={16} />
              {seedStatus === 'seeding' ? 'Seeding...' : seedStatus === 'done' ? '✅ Done! Reload the page' : seedStatus === 'error' ? '❌ Error — check console' : 'Seed Firestore Database'}
            </button>
            <button
              onClick={handleReseedStudents}
              disabled={studentSeedStatus === 'seeding'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Database size={16} />
              {studentSeedStatus === 'seeding' ? 'Updating...' : studentSeedStatus === 'done' ? '✅ Students Updated!' : studentSeedStatus === 'error' ? '❌ Error — check console' : 'Update Students (605A)'}
            </button>
          </div>
          {seedStatus === 'done' && (
            <p className="text-xs text-green-700 mt-2">All data uploaded. You can remove this button now.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
