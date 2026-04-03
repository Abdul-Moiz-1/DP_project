import type React from "react"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react"
import { MoreVerticalIcon } from "lucide-react"

interface ActionItem {
  key: string
  label: string
  icon?: React.ReactNode
  color?: "default" | "danger" | "warning" | "success"
  onClick?: () => void
}

interface ActionMenuProps {
  actions: ActionItem[]
  size?: "sm" | "md" | "lg"
}

export function ActionMenu({ actions, size = "sm" }: ActionMenuProps) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly className="bg-transparent" size={size} variant="light">
          <MoreVerticalIcon className="w-4 h-4" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Actions"
        onAction={(key) => {
          const action = actions.find((a) => a.key === key)
          action?.onClick?.()
        }}
      >
        {actions.map((action) => (
          <DropdownItem key={action.key} color={action.color || "default"} startContent={action.icon}>
            {action.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}
