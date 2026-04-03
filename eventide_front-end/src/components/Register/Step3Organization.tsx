// src/components/auth/Step3Organization.tsx
import { Input, Button, Autocomplete, AutocompleteItem } from '@heroui/react';

interface organizerProfile {
  organizationName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface Step3Props {
  formData: {
    organizationName: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  errors: Record<string, string>;
  createNewOrg: boolean;
  // organizerProfile: organizerProfile;
  onToggleNewOrg: () => void;
  onChange: (field: string, value: string) => void;
  onOpenInfo: () => void;
}

const Step3Organization = ({
  formData,
  errors,
  createNewOrg,
  onToggleNewOrg,
  onChange,
  onOpenInfo,
}: Step3Props) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {createNewOrg ? 'Create New Organization' : 'Select Organization'}
        </label>
        <Button size="sm" variant="light" color="primary" onPress={onToggleNewOrg}>
          {createNewOrg ? 'Select Existing' : 'Create New'}
        </Button>
      </div>

      {createNewOrg ? (

        <>
          <Input
            label="Organization Name"
            placeholder="Enter organization name"
            value={formData.organizationName}
            onChange={(e) => onChange('organizationName', e.target.value)}
            isInvalid={!!errors.organizationName}
            errorMessage={errors.organizationName}
            variant="bordered"
            size="lg"
          />

          <Input
            type="address"
            label="Business Address"
            placeholder="St.123, Main Street"
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            isInvalid={!!errors.address}
            errorMessage={errors.address}
            variant="bordered"
            size="lg"
            description="Must match your organization's domain"
          />

          <Input
            type="city"
            label="City"
            placeholder="Enter City"
            value={formData.city}
            onChange={(e) => onChange('city', e.target.value)}
            isInvalid={!!errors.city}
            errorMessage={errors.city}
            variant="bordered"
            size="lg"
          />
          <Input
            type="state"
            label="State" 
            placeholder="Enter State"
            value={formData.state}
            onChange={(e) => onChange('state', e.target.value)}
            isInvalid={!!errors.state}
            errorMessage={errors.state}
            variant="bordered"
            size="lg"
          />
          <Input
            type="country"
            label="Country"
            placeholder="Enter Country"
            value={formData.country}
            onChange={(e) => onChange('country', e.target.value)}
            isInvalid={!!errors.country}
            errorMessage={errors.country}
            variant="bordered"
            size="lg"
          />
          <Input
            type="zipCode"
            label="Zip Code"
            placeholder="Enter Zip Code"
            value={formData.zipCode}
            onChange={(e) => onChange('zipCode', e.target.value)}
            isInvalid={!!errors.zipCode}
            errorMessage={errors.zipCode}
            variant="bordered"
            size="lg"
          />

          <div className="p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
            <p className="text-sm text-warning-700 dark:text-warning-400">
              <strong>Note:</strong> Organization pending verification. Events will be
              marked "Unverified" until approved.
            </p>
          </div>

          <Button variant="light" color="primary" onPress={onOpenInfo} size="sm">
            Why do we need this information?
          </Button>
        </>
      ) : (undefined)
    }
    </div>
  );
};

export default Step3Organization;