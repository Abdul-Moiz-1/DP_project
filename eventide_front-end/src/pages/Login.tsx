import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input, Button, Checkbox } from '@heroui/react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AxiosError } from 'axios';
import { Logo } from '../components/Icons';

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, isAuthenticated } = useAuth();

  const rawFrom = (location.state as any)?.from;
  const from    = typeof rawFrom === 'string' ? rawFrom : rawFrom?.pathname || '/';

  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.email)                          e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email  = 'Enter a valid email';
    if (!formData.password)                        e.password = 'Password is required';
    else if (formData.password.length < 6)         e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field] || errors.submit) {
      setErrors((p) => ({ ...p, [field]: '', submit: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err: AxiosError | any) {
      setErrors({ submit: err?.response?.data?.message ?? err?.message ?? 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel (desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-between p-10 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <Logo size={22} />
          </div>
          <span className="font-display text-2xl font-bold text-white">Eventide</span>
        </Link>

        {/* Tagline */}
        <div className="relative z-10 space-y-4">
          <h2 className="font-display text-4xl font-bold text-white leading-tight">
            Discover, create,<br />and celebrate together.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Join thousands of event-goers and organizers on the world's most intuitive event platform.
          </p>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/15 backdrop-blur-sm rounded-2xl p-5">
          <p className="text-white text-sm leading-relaxed italic">
            "Eventide made organizing our annual tech conference effortless. The booking system is incredible!"
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-8 w-8 rounded-full bg-white/30 flex items-center justify-center text-white text-sm font-bold flex-none">
              S
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Sarah Chen</p>
              <p className="text-white/60 text-xs">Event Organizer, TechTalks Inc.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center min-h-screen py-12 px-6 lg:px-12 bg-background">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex justify-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center text-white">
              <Logo size={16} />
            </div>
            <span className="font-display font-semibold text-lg">Eventide</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-default-500 mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error banner */}
            {errors.submit && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 text-danger text-sm">
                <AlertCircle size={15} className="flex-none" />
                {errors.submit}
              </div>
            )}

            <Input
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              isInvalid={!!errors.email}
              errorMessage={errors.email}
              variant="bordered"
              size="lg"
            />

            <Input
              type={showPwd ? 'text' : 'password'}
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              isInvalid={!!errors.password}
              errorMessage={errors.password}
              variant="bordered"
              size="lg"
              endContent={
                <button
                  type="button"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPwd((v) => !v)}
                  className="text-default-400 hover:text-default-600 transition-colors"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <div className="flex items-center justify-between">
              <Checkbox
                size="sm"
                isSelected={formData.rememberMe}
                onValueChange={(v) => handleChange('rememberMe', v)}
              >
                <span className="text-sm text-default-600">Remember me</span>
              </Checkbox>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              color="primary"
              size="lg"
              isLoading={loading}
              className="w-full h-11 font-semibold"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-default-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Sign up for free
            </Link>
          </p>

          {/* Dev hint */}
          <div className="mt-8 p-3 bg-default-100 rounded-xl">
            <p className="text-xs text-default-400 text-center">
              <strong>Dev accounts:</strong> organizer@eventide.dev · user@eventide.dev · Password123!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
