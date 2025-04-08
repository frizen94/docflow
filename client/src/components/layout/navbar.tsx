import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { User } from "@shared/schema";

interface NavbarProps {
  title: string;
  user: User;
  openSidebar: () => void;
}

export default function Navbar({ title, user, openSidebar }: NavbarProps) {
  return (
    <header className="bg-white shadow-sm lg:static">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={openSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
          <h1 className="ml-2 lg:ml-0 text-lg font-semibold text-gray-800">{title}</h1>
        </div>

        <div className="ml-4 flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="flex text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
          </div>

          {/* User profile image */}
          <div className="relative">
            <div>
              <Button
                variant="ghost"
                size="icon"
                className="flex items-center max-w-xs text-sm rounded-full text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              >
                <span className="sr-only">Abrir menu do usuário</span>
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
