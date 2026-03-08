import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6" data-testid="admin-login-page">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-slate-900 p-4 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-heading font-bold text-slate-900 text-center mb-2" data-testid="page-title">
            Admin Login
          </h1>
          <p className="text-slate-600 text-center mb-8">Sign in to manage FinSelect India</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@finselect.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                required
                data-testid="email-input"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                required
                data-testid="password-input"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
              data-testid="login-button"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 text-center">
              <strong>Demo Credentials:</strong><br />
              Email: admin@finselect.in<br />
              Password: admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};