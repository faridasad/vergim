import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "../shared/logo";
import { Button } from "../shared/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { clearAuthData, getAuthData } from "@/lib/auth";
import { User, LogOut, Monitor, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { usePOS } from "@/contexts/POSContext";
import { cn } from "@/lib/utils";

function Header() {
  const navigate = useNavigate()
  const auth = getAuthData()
  const { isOnline, activeDevice, isChecking } = usePOS()

  const handleLogout = () => {
    clearAuthData()
    navigate({ to: '/', replace: true })
  }

  return (
    <header className="px-4 flex items-center justify-between mt-6 pb-4">
      <div className="flex items-center gap-4">
        <Link to="/home" className="flex items-center">
          <Logo variant="header" className="h-6.75 object-contain" />
          <span className="text-[14px] text-foreground ml-2 font-medium">innalok</span>
        </Link>

        {activeDevice && (
          <div className={cn(
            "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all animate-in fade-in slide-in-from-left-2",
            isOnline
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          )}>
            <div className="relative">
              <Monitor className="w-3.5 h-3.5" />
              {isChecking && (
                <div className="absolute -top-1 -right-1">
                  <RefreshCw className="w-2 h-2 animate-spin text-primary" />
                </div>
              )}
            </div>
            <span className="max-w-[120px] truncate">{activeDevice.name}</span>
            {isOnline ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          </div>
        )}
      </div>

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
