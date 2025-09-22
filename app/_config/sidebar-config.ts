import { 
  LayoutDashboard, 
  Users, 
  Lock, 
  Settings,
  MessageSquare,
  FileText,
  Calendar,
  Bell,
  Search,
  Plus,
  Shield,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Crown,
  UserCheck,
  UserX,
  Image,
  UserCog,
  BarChart3,
  CreditCard,
  Heart,
  MapPin,
  Star,
  BookOpen,
  HelpCircle,
  LogOut,
  PawPrint
} from "lucide-react";

export interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description?: string;
  children?: SidebarItem[];
  permission?: string;
}

export interface SidebarConfig {
  [role: string]: {
    title: string;
    items: SidebarItem[];
  };
}

export const sidebarConfig: SidebarConfig = {
  super_admin: {
    title: "Super Admin Panel",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "System overview and analytics"
      },
      {
        name: "User Management",
        href: "/admin/users",
        icon: Users,
        description: "Manage all user accounts"
      },
      {
        name: "Password Management",
        href: "/admin/passwords",
        icon: Lock,
        description: "Reset user passwords"
      },
      {
        name: "System Settings",
        href: "/admin/settings",
        icon: Settings,
        description: "Configure system settings"
      },
      {
        name: "Analytics",
        href: "/admin/analytics",
        icon: TrendingUp,
        description: "Advanced system analytics"
      },
      {
        name: "Activity Logs",
        href: "/admin/logs",
        icon: Activity,
        description: "System activity monitoring"
      },
      {
        name: "System Alerts",
        href: "/admin/alerts",
        icon: AlertCircle,
        description: "Manage system notifications"
      },
      {
        name: "Breed Management",
        href: "/admin/breeds",
        icon: PawPrint,
        description: "Manage dog breeds"
      },
      {
        name: "Manage Breed Type",
        href: "/admin/breed-type-images",
        icon: Image,
        description: "Manage breed type categories and images"
      },
      {
        name: "Blog Management",
        href: "/admin/blogs",
        icon: FileText,
        description: "Manage blog posts and categories"
      }
    ]
  },
  admin: {
    title: "Admin Panel",
    items: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        description: "System overview and analytics"
      },
      {
        name: "User Management",
        href: "/admin/users",
        icon: Users,
        description: "Manage user accounts"
      },
      {
        name: "Password Management",
        href: "/admin/passwords",
        icon: Lock,
        description: "Reset user passwords"
      },
      {
        name: "Settings",
        href: "/admin/settings",
        icon: Settings,
        description: "System configuration"
      },
      {
        name: "Breed Management",
        href: "/admin/breeds",
        icon: PawPrint,
        description: "Manage dog breeds"
      }
    ]
  },
  user: {
    title: "User Dashboard",
    items: [
      {
        name: "Dashboard",
        href: "/account",
        icon: LayoutDashboard,
        description: "Your account overview"
      },
      {
        name: "My Listings",
        href: "/account/listings",
        icon: FileText,
        description: "Manage your listings"
      },
      {
        name: "Meetings",
        href: "/account/meetings",
        icon: Calendar,
        description: "Schedule and manage meetings"
      },
      {
        name: "Inbox",
        href: "/account/inbox",
        icon: MessageSquare,
        badge: 3,
        description: "Messages and notifications"
      },
      {
        name: "Favorites",
        href: "/account/favorites",
        icon: Heart,
        description: "Your saved items"
      },
      {
        name: "Payments",
        href: "/account/payments",
        icon: CreditCard,
        description: "Payment history and billing"
      },
      {
        name: "Profile",
        href: "/account/profile",
        icon: UserCheck,
        description: "Manage your profile"
      },
      {
        name: "Help & Support",
        href: "/account/support",
        icon: HelpCircle,
        description: "Get help and support"
      }
    ]
  }
};

// Helper function to get sidebar config for a role
export const getSidebarConfig = (role: string = 'user') => {
  return sidebarConfig[role] || sidebarConfig.user;
};

// Helper function to check if user has permission for a route
export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    'super_admin': 3,
    'admin': 2,
    'user': 1
  };
  
  return (roleHierarchy[userRole as keyof typeof roleHierarchy] || 0) >= 
         (roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0);
};

// Helper function to get filtered sidebar items based on permissions
export const getFilteredSidebarItems = (userRole: string): SidebarItem[] => {
  const config = getSidebarConfig(userRole);
  return config.items.filter(item => {
    if (!item.permission) return true;
    return hasPermission(userRole, item.permission);
  });
}; 