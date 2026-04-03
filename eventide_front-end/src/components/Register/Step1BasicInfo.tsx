// src/components/auth/Step1BasicInfo.tsx
import { Input, Progress } from '@heroui/react';

interface Step1Props {
  formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  errors: Record<string, string>;
  showPassword: boolean;
  onTogglePassword: () => void;
  onChange: (field: string, value: string) => void;
}

const Step1BasicInfo = ({
  formData,
  errors,
  showPassword,
  onTogglePassword,
  onChange,
}: Step1Props) => {
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: 'default' as const };

    let strength = 0;
    if (password.length >= 8) strength += 40;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 30;
    if (/\d/.test(password)) strength += 30;

    if (strength >= 75) return { strength, label: 'Strong', color: 'success' as const };
    if (strength >= 50) return { strength, label: 'Medium', color: 'warning' as const };
    return { strength, label: 'Weak', color: 'danger' as const };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Full Name"
        placeholder="Enter your full name"
        value={formData.name}
        onChange={(e) => onChange('name', e.target.value)}
        isInvalid={!!errors.name}
        errorMessage={errors.name}
        variant="bordered"
        size="lg"
      />

      <Input
        type="email"
        label="Email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={(e) => onChange('email', e.target.value)}
        isInvalid={!!errors.email}
        errorMessage={errors.email}
        variant="bordered"
        size="lg"
      />

      <div>
        <Input
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Create a password"
          value={formData.password}
          onChange={(e) => onChange('password', e.target.value)}
          isInvalid={!!errors.password}
          errorMessage={errors.password}
          variant="bordered"
          size="lg"
          endContent={
            <button type="button" onClick={onTogglePassword}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          }
        />
        {formData.password && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-default-500">Password strength</span>
              <span className={`text-${passwordStrength.color}`}>
                {passwordStrength.label}
              </span>
            </div>
            <Progress
              value={passwordStrength.strength}
              color={passwordStrength.color}
              size="sm"
            />
          </div>
        )}
      </div>

      <Input
        type="password"
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={formData.confirmPassword}
        onChange={(e) => onChange('confirmPassword', e.target.value)}
        isInvalid={!!errors.confirmPassword}
        errorMessage={errors.confirmPassword}
        variant="bordered"
        size="lg"
      />
    </div>
  );
};

export default Step1BasicInfo;