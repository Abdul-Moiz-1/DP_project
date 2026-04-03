// src/components/auth/Step2AccountType.tsx
import { Link } from 'react-router-dom';
import { Checkbox } from '@heroui/react';
import { UserRole } from '../../types/user.types';

interface Step2Props {
  selectedRole: UserRole;
  agreeToTerms: boolean;
  errors: Record<string, string>;
  onRoleChange: (role: UserRole) => void;
  onTermsChange: (checked: boolean) => void;
}

const Step2AccountType = ({
  selectedRole,
  agreeToTerms,
  errors,
  onRoleChange,
  onTermsChange,
}: Step2Props) => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-sm font-medium mb-3">
          Select Account Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onRoleChange(UserRole.USER)}
            className={`p-6 border-2 rounded-xl transition-all ${
              selectedRole === UserRole.USER
                ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
                : 'border-default-200 hover:border-default-300'
            }`}
          >
            <div className="text-4xl mb-3">🎟️</div>
            <h3 className="font-bold text-lg mb-2">Attendee</h3>
            <p className="text-sm text-default-500">
              Browse events, buy tickets, and leave reviews
            </p>
          </button>

          <button
            type="button"
            onClick={() => onRoleChange(UserRole.ORGANIZER)}
            className={`p-6 border-2 rounded-xl transition-all ${
              selectedRole === UserRole.ORGANIZER
                ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
                : 'border-default-200 hover:border-default-300'
            }`}
          >
            <div className="text-4xl mb-3">🎭</div>
            <h3 className="font-bold text-lg mb-2">Organizer</h3>
            <p className="text-sm text-default-500">
              Create and manage events, track sales
            </p>
          </button>
        </div>
        {errors.role && (
          <p className="text-danger text-sm mt-2">{errors.role}</p>
        )}
      </div>

      <Checkbox
        isSelected={agreeToTerms}
        onValueChange={onTermsChange}
        isInvalid={!!errors.agreeToTerms}
        size="sm"
      >
        <span className="text-sm">
          I agree to the{' '}
          <Link to="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </span>
      </Checkbox>
      {errors.agreeToTerms && (
        <p className="text-danger text-sm -mt-2">{errors.agreeToTerms}</p>
      )}
    </div>
  );
};

export default Step2AccountType;