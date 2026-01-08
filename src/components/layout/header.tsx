import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "../shared/logo";
import { Button } from "../shared/button";
import { LogOut } from "lucide-react";
import { clearAuthData } from "@/lib/auth";


function Header() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuthData()
    navigate({ to: '/', replace: true })
  }

  return (
    <header className="px-4 flex items-center justify-between mt-6 pb-4">
      <Link to="/home" className="flex items-center">
        <Logo variant="header" className="h-6.75 object-contain" />
        <span className="text-[14px] text-foreground ml-2 font-medium">innalok</span>
      </Link>

      <div className="flex items-center gap-2">
        <Button variant="ghost" className="text-red-500" onClick={handleLogout}>
          <div className="flex items-center gap-2">
            <span className="text-[14px] ">Logout</span>
            <LogOut className="text-red-500 w-4 h-4" />
          </div>
        </Button>

      </div>
    </header>
  );
}

export default Header;
