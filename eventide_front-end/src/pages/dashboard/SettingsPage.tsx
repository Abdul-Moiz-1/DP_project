"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Chip,
  Avatar,
  Divider,
  Spinner,
} from "@heroui/react";
import {
  KeyRound,
  Mail,
  Save,
  Shield,
  User as UserIcon,
  Building2,
  MapPin,
  Heart,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { eventService } from "@/services/eventService";
import { useToast } from "@/components/toast-provider";
import { api } from "@/api/api";

const inputClassNames = {
  label: "pb-1 text-sm font-medium text-default-700 dark:text-default-300",
  inputWrapper:
    "min-h-12 border border-divider bg-content1 shadow-none transition-colors group-data-[focus=true]:border-primary group-data-[hover=true]:border-default-400",
  input: "text-foreground placeholder:text-default-400",
  description: "text-default-500",
  errorMessage: "text-danger",
};

const readOnlyInputClassNames = {
  ...inputClassNames,
  inputWrapper:
    "min-h-12 border border-divider bg-default-100/80 shadow-none opacity-100",
  input: "text-default-700 dark:text-default-300",
};

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { success, warning } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [orgName, setOrgName] = useState(user?.organizerProfile?.organizationName || "");
  const [orgAddress, setOrgAddress] = useState(user?.organizerProfile?.address || "");
  const [orgCity, setOrgCity] = useState(user?.organizerProfile?.city || "");
  const [orgState, setOrgState] = useState(user?.organizerProfile?.state || "");
  const [orgCountry, setOrgCountry] = useState(user?.organizerProfile?.country || "");
  const [orgZip, setOrgZip] = useState(user?.organizerProfile?.zipCode || "");
  const [savingOrg, setSavingOrg] = useState(false);

  // Preferences state
  const [allCategories, setAllCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      setLoadingPrefs(true);
      try {
        const [categoriesRes, prefsRes] = await Promise.all([
          api.get("/categories"),
          eventService.fetchUserPreferences(),
        ]);
        setAllCategories(categoriesRes.data || []);
        const prefIds = (prefsRes || []).map((p: any) => p.id ?? p.category?.id ?? p.categoryId).filter(Boolean);
        setSelectedCategoryIds(prefIds);
      } catch {
        try {
          const categoriesRes = await api.get("/categories");
          setAllCategories(categoriesRes.data || []);
        } catch { /* silent */ }
      } finally {
        setLoadingPrefs(false);
      }
    };
    loadPreferences();
  }, []);

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      await eventService.setUserPreferences(selectedCategoryIds);
      success("Interests saved! Your recommendations will update shortly.");
    } catch (error: any) {
      warning(error.response?.data?.message || "Failed to save preferences");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) { warning("Name cannot be empty"); return; }
    setSaving(true);
    try {
      await eventService.updateProfile({ name: name.trim() });
      updateUser({ name: name.trim() });
      success("Profile updated successfully");
    } catch (error: any) {
      warning(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { warning("Please fill in all password fields"); return; }
    if (newPassword.length < 6) { warning("New password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { warning("New passwords do not match"); return; }
    setChangingPassword(true);
    try {
      await eventService.changePassword(currentPassword, newPassword);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      success("Password changed successfully");
    } catch (error: any) {
      warning(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUpdateOrgProfile = async () => {
    if (!orgName.trim()) { warning("Organization name is required"); return; }
    setSavingOrg(true);
    try {
      await eventService.updateOrganizerProfile({
        organizationName: orgName.trim(),
        address: orgAddress.trim(),
        city: orgCity.trim(),
        state: orgState.trim(),
        country: orgCountry.trim(),
        zipCode: orgZip.trim(),
      });
      success("Organization profile updated");
    } catch (error: any) {
      warning(error.response?.data?.message || "Failed to update organization profile");
    } finally {
      setSavingOrg(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-default-400 mt-0.5 text-sm">Manage your account and preferences</p>
      </div>

      {/* Profile Info */}
      <Card className="border border-divider shadow-card">
        <CardHeader className="px-6 pt-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Profile Information</h2>
              <p className="text-default-400 text-sm">Update your personal details</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6 pb-5 space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <Avatar name={user?.name} size="lg" />
            <div>
              <p className="font-semibold text-foreground">{user?.name}</p>
              <Chip size="sm" variant="flat" color="primary" className="font-semibold tracking-wide">
                {user?.role}
              </Chip>
            </div>
          </div>
          <Divider />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Full Name"
              labelPlacement="outside"
              variant="bordered"
              value={name}
              onValueChange={setName}
              startContent={<UserIcon className="w-4 h-4 text-default-400" />}
              classNames={inputClassNames}
            />
            <Input
              label="Email"
              labelPlacement="outside"
              variant="bordered"
              value={user?.email || ""}
              isReadOnly
              startContent={<Mail className="w-4 h-4 text-default-400" />}
              description="Email cannot be changed"
              classNames={readOnlyInputClassNames}
            />
          </div>
          <div className="flex justify-end">
            <Button color="primary" isLoading={saving} startContent={!saving && <Save className="w-4 h-4" />} onPress={handleUpdateProfile}>
              Save Changes
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Interest Preferences */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="px-6 pt-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-danger/10">
              <Heart className="w-5 h-5 text-danger" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Event Interests</h2>
              <p className="text-default-400 text-sm">Select categories to personalize your recommendations</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6 pb-5">
          {loadingPrefs ? (
            <div className="flex justify-center py-6"><Spinner size="md" /></div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {allCategories.map((cat) => {
                  const isSelected = selectedCategoryIds.includes(cat.id);
                  return (
                    <Chip
                      key={cat.id}
                      variant={isSelected ? "solid" : "bordered"}
                      color={isSelected ? "primary" : "default"}
                      className="cursor-pointer border-default-300 px-1 transition-all data-[hover=true]:border-primary/50"
                      onClick={() => toggleCategory(cat.id)}
                    >
                      {cat.name}
                    </Chip>
                  );
                })}
                {allCategories.length === 0 && (
                  <p className="text-default-400 text-sm">No categories available.</p>
                )}
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-default-400">
                  {selectedCategoryIds.length} interest{selectedCategoryIds.length !== 1 ? "s" : ""} selected
                </p>
                <Button
                  color="primary"
                  isLoading={savingPrefs}
                  startContent={!savingPrefs && <Save className="w-4 h-4" />}
                  onPress={handleSavePreferences}
                  isDisabled={allCategories.length === 0}
                >
                  Save Interests
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Change Password */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="px-6 pt-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <KeyRound className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Change Password</h2>
              <p className="text-default-400 text-sm">Update your account password</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6 pb-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Current Password"
              labelPlacement="outside"
              variant="bordered"
              type="password"
              value={currentPassword}
              onValueChange={setCurrentPassword}
              startContent={<Shield className="w-4 h-4 text-default-400" />}
              classNames={inputClassNames}
            />
            <Input
              label="New Password"
              labelPlacement="outside"
              variant="bordered"
              type="password"
              value={newPassword}
              onValueChange={setNewPassword}
              description="Minimum 6 characters"
              classNames={inputClassNames}
            />
          </div>
          <Input
            label="Confirm New Password"
            labelPlacement="outside"
            variant="bordered"
            type="password"
            value={confirmPassword}
            onValueChange={setConfirmPassword}
            isInvalid={confirmPassword !== "" && confirmPassword !== newPassword}
            errorMessage={confirmPassword !== "" && confirmPassword !== newPassword ? "Passwords do not match" : undefined}
            classNames={inputClassNames}
          />
          <div className="flex justify-end">
            <Button color="warning" isLoading={changingPassword} startContent={!changingPassword && <KeyRound className="w-4 h-4" />} onPress={handleChangePassword}>
              Change Password
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Organizer Profile */}
      {user?.role === "ORGANIZER" && (
        <Card className="border border-default-200 shadow-sm">
          <CardHeader className="px-6 pt-5 pb-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Building2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Organization Profile</h2>
                <p className="text-default-400 text-sm">Manage your organization details</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-5 space-y-4">
            <Input
              label="Organization Name"
              labelPlacement="outside"
              variant="bordered"
              value={orgName}
              onValueChange={setOrgName}
              startContent={<Building2 className="w-4 h-4 text-default-400" />}
              classNames={inputClassNames}
            />
            <Input
              label="Address"
              labelPlacement="outside"
              variant="bordered"
              value={orgAddress}
              onValueChange={setOrgAddress}
              startContent={<MapPin className="w-4 h-4 text-default-400" />}
              classNames={inputClassNames}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="City"
                labelPlacement="outside"
                variant="bordered"
                value={orgCity}
                onValueChange={setOrgCity}
                classNames={inputClassNames}
              />
              <Input
                label="State"
                labelPlacement="outside"
                variant="bordered"
                value={orgState}
                onValueChange={setOrgState}
                classNames={inputClassNames}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Country"
                labelPlacement="outside"
                variant="bordered"
                value={orgCountry}
                onValueChange={setOrgCountry}
                classNames={inputClassNames}
              />
              <Input
                label="ZIP Code"
                labelPlacement="outside"
                variant="bordered"
                value={orgZip}
                onValueChange={setOrgZip}
                classNames={inputClassNames}
              />
            </div>
            <div className="flex justify-end">
              <Button color="success" isLoading={savingOrg} startContent={!savingOrg && <Save className="w-4 h-4" />} onPress={handleUpdateOrgProfile}>
                Save Organization
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

