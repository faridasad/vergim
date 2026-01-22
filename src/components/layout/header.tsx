import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "../shared/logo";
import { Button } from "../shared/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { clearAuthData, getAuthData } from "@/lib/auth";
import { User, LogOut } from "lucide-react";



function Header() {
  const navigate = useNavigate()
  const auth = getAuthData()

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
        {auth && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-medium">{auth.ownerInfo.name}</span>
                  <span className="text-xs text-muted-foreground">{auth.ownerInfo.company_name}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 mr-4" align="end">
              <div className="space-y-4">
                <div className="space-y-1 border-b pb-2">
                  <h4 className="font-medium text-sm">Hesab Məlumatları</h4>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                  <span className="text-gray-500">Hesab:</span>
                  <span className="font-mono">{auth.account_number}</span>

                  <span className="text-gray-500">Şirkət:</span>
                  <span>{auth.ownerInfo.company_name}</span>

                  <span className="text-gray-500">Ad:</span>
                  <span>{auth.ownerInfo.name}</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        <Button variant="ghost" size="icon" className="text-red-500" onClick={handleLogout} title="Çıxış">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}

export default Header;
