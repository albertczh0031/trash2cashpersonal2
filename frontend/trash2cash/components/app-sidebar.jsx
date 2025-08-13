import { useEffect, useState } from "react";
import {
  ChartNoAxesCombined,
  History,
  CirclePercent,
  Store,
  User,
  Camera,
  Menu,
  Newspaper,
  House,
} from "lucide-react";
import { SignoutButton } from "@/components/SignoutButton";
import { refreshAccessToken } from "@/utils/refreshAccessToken"; // Import the function to refresh access token
import Link from "next/link"; // Import Link from Next.js

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const [role, setRole] = useState(null); // State to store the user's role
  const [loading, setLoading] = useState(true); // State to track loading

  // Fetch the user's role from the backend
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token = localStorage.getItem("access"); // Retrieve the token from localStorage
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch("https://trash2cashpersonal2.onrender.com/api/user-role/", {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });

        // If the access token is expired, refresh it
        if (response.status === 401) {
          const access = await refreshAccessToken();
          response = await fetch("https://trash2cashpersonal2.onrender.com/api/user-role/", {
            headers: {
              Authorization: `Bearer ${access}`,
            },
          });
        }

        if (!response.ok) {
          throw new Error("Failed to fetch user role");
        }

        const data = await response.json();
        setRole(data.role); // Set the role to "admin" or "user"
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchRole();
  }, []);

  // Menu items for admin / user
  const userMenu = [
    {
      title: "HomePage",
      url: "/dashboard",
      icon: House,
    },
    {
      title: "Update Password",
      url: "/account/change-password",
      icon: User,
    },
    {
      title: "Snap to Recycle",
      url: "/upload",
      icon: Camera,
    },
    {
      title: "Rewards",
      url: "/rewards",
      icon: CirclePercent,
    },
    {
      title: "History",
      url: "/appointment",
      icon: History,
    },
    {
      title: "Statistics",
      url: "/statistics",
      icon: ChartNoAxesCombined,
    },
    {
      title: "Market",
      url: "/market",
      icon: Store,
    },
  ];
/// THIS SECTION ONWARDS IS ADMIN
  const adminMenu = [
    {
      title: "HomePage",
      url: "/dashboard",
      icon: House,
    },
    {
      title: "Update Password",
      url: "/account/change-password",
      icon: User,
    },
    {
      title: "Manage Center Details",
      url: "/recycling-centres/1",
      icon: Store,
    },
    {
      title: "Customer Appointment",
      url: "/appointment-view",
      icon: Newspaper,
    },
    // {
    //   title: "Rewards",
    //   url: "/rewards",
    //   icon: CirclePercent,
    // },
    // {
    //   title: "History",
    //   url: "/appointment",
    //   icon: History,
    // },
    {
      title: "Statistics",
      url: "/statistics",
      icon: ChartNoAxesCombined,
    },
    {
      title: "Market",
      url: "#",
      icon: Store,
    },
  ];

  const items = role === "admin" ? adminMenu : userMenu;

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while fetching the role
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="transform scale-125 text-center justify-center">
            Trash2Cash
            <br />
            {role === "admin" && "ADMIN VIEW"}
            {role === "user" && "USER VIEW"}
          </SidebarGroupLabel>
          <br />
          <SidebarGroupContent>
            <SidebarMenu className="items-center justify-center" items={items}>
              <Menu className="h-8 w-8 items-center justify-center"></Menu>
              
              <br />

              {items.map((item) => (
                <SidebarMenuItem className="transform scale-125" key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                // <SidebarMenuItem key={item.title}>
                //   <SidebarMenuButton asChild isActive={item.isActive}>
                //     <a href={item.url}>
                //       <item.icon className="text-inherit" />
                //       <span>{item.title}</span>
                //     </a>
                //   </SidebarMenuButton>
                // </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter>
          <SignoutButton />
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
