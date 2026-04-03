"use client"

import { Input } from "@heroui/react"
import { SearchIcon } from "lucide-react"

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
}

export function SearchBar({ placeholder = "Search...", value, onChange, onSearch }: SearchBarProps) {
  return (
    <Input
      isClearable
      type="text"
      placeholder={placeholder}
      startContent={<SearchIcon className="w-4 h-4 text-gray-400" />}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSearch?.(e.currentTarget.value)
        }
      }}
      className="w-full"
      classNames={{
        input: "text-sm",
        inputWrapper: "border border-gray-200",
      }}
    />
  )
}
