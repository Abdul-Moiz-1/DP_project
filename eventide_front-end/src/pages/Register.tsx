import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Progress } from '@heroui/react';
import { Button } from '@heroui/react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user.types';
import { Logo } from '../components/Icons';
import Step1BasicInfo from '../components/Register/Step1BasicInfo';
import Step2AccountType from '../components/Register/Step2AccountType';
import Step3Organization from '../components/Register/Step3Organization';
import InfoModal from '../components/Register/InfoModal';

const STEP_LABELS = ['Your info', 'Account type', 'Organization'];

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const initialRole =
    searchParams.get('type') === 'organizer' ? UserRole.ORGANIZER : UserRole.USER;

  const [step,           setStep]           = useState(1);
  const [showPassword,   setShowPassword]   = useState(false);
  const [showModal,      setShowModal]      = useState(false);
  const [createNewOrg,   setCreateNewOrg]   = useState(false);
  const [isLoading,      setIsLoading]      = useState(false);
  const [errors,         setErrors]         = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name:             '',
    email:            '',
    password:         '',
    confirmPassword:  '',
    role:             initialRole,
    agreeToTerms:     false,
    organizationName: '',
    address:          '',
    city:             '',
    state:            '',
    country:          '',
    zipCode:          '',
  });

  const totalSteps = formData.role === UserRole.ORGANIZER ? 3 : 2;

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name.trim())                      e.name            = 'Name is required';
      if (!formData.email)                            e.email           = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email           = 'Enter a valid email';
      if (!formData.password)                         e.password        = 'Password is required';
      else if (formData.password.length < 8)          e.password        = 'Min 8 characters';
      if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    if (step === 2) {
      if (!formData.role)        e.role        = 'Select a role';
      if (!formData.agreeToTerms) e.agreeToTerms = 'You must agree to the terms';
    }
    if (step === 3 && createNewOrg) {
      if (!formData.organizationName.trim()) e.organizationName = 'Organization name required';
      if (!formData.address)  e.address  = 'Address is required';
      if (!formData.city)     e.city     = 'City is required';
      if (!formData.state)    e.state    = 'State is required';
      if (!formData.country)  e.country  = 'Country is required';
      if (!formData.zipCode)  e.zipCode  = 'Zip code is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const isOrg = formData.role === UserRole.ORGANIZER && createNewOrg;
      await register({
        name:     formData.name,
        email:    formData.email,
        password: formData.password,
        organizerProfile: isOrg ? {
          organizationName: formData.organizationName,
          address:          formData.address,
          city:             formData.city,
          state:            formData.state,
          country:          formData.country,
          zipCode:          formData.zipCode,
        } : undefined,
      });
    } catch {
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!validate()) return;
    if ((step === 2 && formData.role === UserRole.USER) || step === totalSteps) {
      await handleSubmit();
    } else {
      setStep((s) => s + 1);
    }
  };

  const progressPct = ((step - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel (desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <Logo size={22} />
          </div>
          <span className="font-display text-2xl font-bold text-white">Eventide</span>
        </Link>

        <div className="relative z-10 space-y-4">
          <h2 className="font-display text-4xl font-bold text-white leading-tight">
            Your next great<br />experience starts here.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Create an account to discover amazing events, or start hosting your own.
          </p>
          <div className="flex flex-col gap-3 mt-6">
            {[
              '✨ Curated events tailored to your interests',
              '🎟 Seamless ticket booking in seconds',
              '📊 Powerful analytics for organizers',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-white/80 text-sm">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-white/15 backdrop-blur-sm rounded-2xl p-5">
          <p className="text-white text-sm leading-relaxed italic">
            "I sold out my first event within 48 hours thanks to Eventide's recommendation engine."
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-8 w-8 rounded-full bg-white/30 flex items-center justify-center text-white text-sm font-bold flex-none">
              M
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Marcus Rivera</p>
              <p className="text-white/60 text-xs">Independent Music Organizer</p>
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
          {/* Header + progress */}
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold text-foreground">Create account</h1>
            <p className="text-default-500 mt-1">
              Step {step} of {totalSteps} — {STEP_LABELS[step - 1]}
            </p>
            <div className="mt-4">
              <Progress
                value={step === 1 ? 33 : progressPct}
                color="primary"
                size="sm"
                className="mt-2"
              />
            </div>
          </div>

          {/* Error banner */}
          {errors.submit && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 text-danger text-sm mb-4">
              {errors.submit}
            </div>
          )}

          {/* Step content */}
          {step === 1 && (
            <Step1BasicInfo
              formData={formData}
              errors={errors}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((v) => !v)}
              onChange={handleChange}
            />
          )}
          {step === 2 && (
            <Step2AccountType
              selectedRole={formData.role}
              agreeToTerms={formData.agreeToTerms}
              errors={errors}
              onRoleChange={(role) => handleChange('role', role)}
              onTermsChange={(checked) => handleChange('agreeToTerms', checked)}
            />
          )}
          {step === 3 && (
            <Step3Organization
              formData={formData}
              errors={errors}
              createNewOrg={createNewOrg}
              onToggleNewOrg={() => setCreateNewOrg((v) => !v)}
              onChange={handleChange}
              onOpenInfo={() => setShowModal(true)}
            />
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="flat"
              onPress={() => setStep((s) => s - 1)}
              isDisabled={step === 1}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              color="primary"
              onPress={handleNext}
              isLoading={isLoading}
              className="flex-1 font-semibold"
            >
              {step === totalSteps ? 'Create account' : 'Continue'}
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-default-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <InfoModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default Register;
