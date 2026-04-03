// src/layouts/DashboardLayout.tsx
import SidebarMenu from "@/components/dashboard/layout/SidebarMenu";
import TopBar from "@/components/dashboard/layout/TopBar";
import { Outlet } from "react-router-dom";
import { organizerSidebarItems, userSidebarItems } from "./sideBarConfig";
import { useAuth } from "@/contexts/AuthContext";

const DashboardLayout = () => {

  const { user } = useAuth();

  const sideBarItems = user?.role === 'ORGANIZER' ? organizerSidebarItems : userSidebarItems;
  
  return (
    <div className="flex min-h-screen bg-default-50">
      <SidebarMenu sideBarItems={sideBarItems}/>
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;




// "use client"

// import type React from "react"
// import { useState } from "react"
// import {
//   Navbar,
//   NavbarBrand,
//   NavbarContent,
//   Button,
//   Dropdown,
//   DropdownTrigger,
//   DropdownMenu,
//   DropdownItem,
// } from "@heroui/react"
// import { LogOut, Settings, Bell } from "lucide-react"
// import SidebarNav from "./sidebar-nav"
// import { useAuth } from "@/contexts/AuthContext"

// interface DashboardLayoutProps {
//   children: React.ReactNode
//   // userRole: "ORGANIZER" | "ATTENDEE"
//   // userName: string
// }

// export default function DashboardLayout({ children }: DashboardLayoutProps) {
//   const [sidebarOpen, setSidebarOpen] = useState(true)
//   const {user} = useAuth();
//   const userRole = user?.role || "ATTENDEE";
//   const userName = user?.email || "User";

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Top Navbar */}
//       <Navbar isBordered className="border-border bg-card fixed top-0 w-full z-50">
//         <NavbarBrand className="gap-3">
//           <div className="font-bold text-lg text-primary">EVENTIDE</div>
//           <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
//             {userRole === "ORGANIZER" ? "Organizer" : "Attendee"}
//           </span>
//         </NavbarBrand>

//         <NavbarContent justify="end" className="gap-4">
//           <Button isIconOnly variant="light" className="text-foreground">
//             <Bell className="w-5 h-5" />
//           </Button>
//           <Dropdown>
//             <DropdownTrigger>
//               <Button isIconOnly variant="light" className="text-foreground">
//                 <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
//                   {userName.charAt(0).toUpperCase()}
//                 </div>
//               </Button>
//             </DropdownTrigger>
//             <DropdownMenu aria-label="User menu">
//               <DropdownItem key="profile" description={userName}>
//                 Profile
//               </DropdownItem>
//               <DropdownItem key="settings" startContent={<Settings className="w-4 h-4" />}>
//                 Settings
//               </DropdownItem>
//               <DropdownItem key="logout" startContent={<LogOut className="w-4 h-4" />} color="danger">
//                 Logout
//               </DropdownItem>
//             </DropdownMenu>
//           </Dropdown>
//         </NavbarContent>
//       </Navbar>

//       {/* Sidebar */}
//       <SidebarNav userRole={userRole} />

//       {/* Main Content */}
//       <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-20"}`}>{children}</main>
//     </div>
//   )
// }

