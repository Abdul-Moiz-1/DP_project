"use client"

import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react"

interface UserProfileProps {
  name: string
  role?: string
  avatar?: string
  onLogout?: () => void
  onSettings?: () => void
}

export function UserProfile({ name, role, avatar, onLogout, onSettings }: UserProfileProps) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Avatar as="button" className="transition-transform" color="secondary" name={name} size="md" src={avatar} />
      </DropdownTrigger>
      <DropdownMenu aria-label="User menu">
        <DropdownItem key="profile" isReadOnly className="h-14 gap-2">
          <p className="font-semibold">{name}</p>
          {role && <p className="text-xs text-gray-500">{role}</p>}
        </DropdownItem>
        <DropdownItem key="settings" onClick={onSettings}>
          Settings
        </DropdownItem>
        <DropdownItem key="logout" color="danger" onClick={onLogout}>
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
export default UserProfile;