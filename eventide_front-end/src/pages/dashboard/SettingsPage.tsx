"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Chip,
  Avatar,
  Divider,
} from "@heroui/react";
import {
  KeyRound,
  Mail,
  Save,
  Shield,
  User as UserIcon,
  Building2,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { eventService } from "@/services/eventService";
import { useToast } from "@/components/toast-provider";

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

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      warning("Name cannot be empty");
      return;
    }
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
    if (!currentPassword || !newPassword) {
      warning("Please fill in all password fields");
      return;
    }
    if (newPassword.length < 6) {
      warning("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      warning("New passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      await eventService.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      success("Password changed successfully");
    } catch (error: any) {
      warning(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUpdateOrgProfile = async () => {
    if (!orgName.trim()) {
      warning("Organization name is required");
      return;
    }
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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-default-400 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Info */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="px-6 pt-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Profile Information
              </h2>
              <p className="text-default-400 text-sm">
                Update your personal details
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6 pb-5 space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <Avatar name={user?.name} size="lg" />
            <div>
              <p className="font-semibold text-foreground">{user?.name}</p>
              <Chip size="sm" variant="flat" color="primary">
                {user?.role}
              </Chip>
            </div>
          </div>
          <Divider />
          <Input
            label="Full Name"
            value={name}
            onValueChange={setName}
            startContent={<UserIcon className="w-4 h-4 text-default-400" />}
          />
          <Input
            label="Email"
            value={user?.email || ""}
            isReadOnly
            startContent={<Mail className="w-4 h-4 text-default-400" />}
            description="Email cannot be changed"
          />
          <div className="flex justify-end">
            <Button
              color="primary"
              isLoading={saving}
              startContent={!saving && <Save className="w-4 h-4" />}
              onPress={handleUpdateProfile}
            >
              Save Changes
            </Button>
          </div>
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
              <h2 className="text-lg font-bold text-foreground">
                Change Password
              </h2>
              <p className="text-default-400 text-sm">
                Update your account password
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6 pb-5 space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onValueChange={setCurrentPassword}
            startContent={<Shield className="w-4 h-4 text-default-400" />}
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onValueChange={setNewPassword}
            description="Minimum 6 characters"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onValueChange={setConfirmPassword}
            isInvalid={confirmPassword !== "" && confirmPassword !== newPassword}
            errorMessage={
              confirmPassword !== "" && confirmPassword !== newPassword
                ? "Passwords do not match"
                : undefined
            }
          />
          <div className="flex justify-end">
            <Button
              color="warning"
              variant="flat"
              isLoading={changingPassword}
              startContent={!changingPassword && <KeyRound className="w-4 h-4" />}
              onPress={handleChangePassword}
            >
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
                <h2 className="text-lg font-bold text-foreground">
                  Organization Profile
                </h2>
                <p className="text-default-400 text-sm">
                  Manage your organization details
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-5 space-y-4">
            <Input
              label="Organization Name"
              value={orgName}
              onValueChange={setOrgName}
              startContent={<Building2 className="w-4 h-4 text-default-400" />}
            />
            <Input
              label="Address"
              value={orgAddress}
              onValueChange={setOrgAddress}
              startContent={<MapPin className="w-4 h-4 text-default-400" />}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" value={orgCity} onValueChange={setOrgCity} />
              <Input label="State" value={orgState} onValueChange={setOrgState} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Country" value={orgCountry} onValueChange={setOrgCountry} />
              <Input label="ZIP Code" value={orgZip} onValueChange={setOrgZip} />
            </div>
            <div className="flex justify-end">
              <Button
                color="success"
                variant="flat"
                isLoading={savingOrg}
                startContent={!savingOrg && <Save className="w-4 h-4" />}
                onPress={handleUpdateOrgProfile}
              >
                Save Organization
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
