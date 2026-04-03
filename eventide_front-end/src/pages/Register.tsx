


// src/pages/Register.tsx - SIMPLIFIED VERSION
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter, Button, Progress } from '@heroui/react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user.types';
import Step1BasicInfo from '../components/Register/Step1BasicInfo';
import Step2AccountType from '../components/Register/Step2AccountType';
import Step3Organization from '../components/Register/Step3Organization';
import InfoModal from '../components/Register/InfoModal';



const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isAuthenticated } = useAuth();


  if(isAuthenticated){
    navigate('/');
  }

  const initialRole = searchParams.get('type') === 'organizer' ? UserRole.ORGANIZER : UserRole.USER;

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [createNewOrg, setCreateNewOrg] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
    agreeToTerms: false,
    organizationName: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });

  const totalSteps = formData.role === UserRole.ORGANIZER ? 3 : 2;

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    if (step === 2) {
      if (!formData.role) newErrors.role = 'Select a role';
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to terms';
    }

    if (step === 3) {
      if (createNewOrg) {
        if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name required';
        if (!formData.address) newErrors.businessEmail = 'address is required';
        if (!formData.city) newErrors.registrationNumber = 'City is required';
        if (!formData.state) newErrors.taxId = 'State is required';
        if (!formData.country) newErrors.country = 'Country is required';
        if (!formData.zipCode) newErrors.zipCode = 'Zip Code is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;

    if (step === 2 && formData.role === UserRole.USER) {
      await handleSubmit();
    } else if (step === totalSteps) {
      await handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        organizerProfile: {
          organizationName: createNewOrg ? formData.organizationName : undefined,
          address: createNewOrg ? formData.address: '',
          city: createNewOrg ? formData.city: '',
          state:    createNewOrg ? formData.state: '',
          country:  createNewOrg ? formData.country: '',
          zipCode:  createNewOrg ? formData.zipCode: '',

        }
      });
      console.log(`Data from the form : ${JSON.stringify(formData)}`)
    } catch (error) {
      setErrors({ submit: 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-gray-900 dark:via-background dark:to-gray-800">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Join EventHub
          </h1>
          <p className="text-default-500">Create your account and start exploring events</p>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader className="flex flex-col gap-3 px-6 pt-6">
            <div className="flex justify-between items-center w-full">
              <div>
                <h2 className="text-2xl font-bold">Create Account</h2>
                <p className="text-sm text-default-500">Step {step} of {totalSteps}</p>
              </div>
              <div className="text-sm text-default-500">
                {step === 1 && 'Basic Info'}
                {step === 2 && 'Account Type'}
                {step === 3 && 'Organization'}
              </div>
            </div>
            <Progress value={(step / totalSteps) * 100} color="primary" size="sm" />
          </CardHeader>

          <CardBody className="px-6 py-4">
            {errors.submit && (
              <div className="mb-4 p-3 rounded-lg bg-danger-50 dark:bg-danger-900/20 text-danger text-sm">
                {errors.submit}
              </div>
            )}

            {step === 1 && (
              <Step1BasicInfo
                formData={formData}
                errors={errors}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
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
                onToggleNewOrg={() => setCreateNewOrg(!createNewOrg)}
                onChange={handleChange}
                onOpenInfo={() => setShowModal(true)}
              />
            )}
          </CardBody>

          <CardFooter className="flex justify-between px-6 pb-6">
            <Button variant="light" onPress={() => setStep(step - 1)} isDisabled={step === 1}>
              Back
            </Button>
            <Button color="primary" onPress={handleNext} isLoading={isLoading} size="lg">
              {step === totalSteps ? 'Create Account' : 'Continue'}
            </Button>
          </CardFooter>

          <div className="px-6 pb-6 text-center">
            <p className="text-sm text-default-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>

      <InfoModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default Register;