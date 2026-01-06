import { 
  BarChart2, 
  PieChart, 
  ReceiptTextIcon, 
  Store, 
  Wallet,
  type LucideIcon 
} from "lucide-react";
import { Link } from "@tanstack/react-router";

interface NavItemConfig {
  label: string;
  icon: LucideIcon;
  to: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  { label: "Əsas Səhifə", icon: PieChart, to: "/home" },
  { label: "Receipts", icon: ReceiptTextIcon, to: "/receipts" },
];

function Tabs() {
  return (
    <nav className="px-4 py-2.5 bg-background flex items-center justify-around fixed bottom-0 left-0 right-0 z-50">
      {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
        <Link
          key={label}
          to={to}
          className="flex flex-col items-center gap-1 group cursor-pointer text-gray-400 hover:text-primary transition-colors"
          activeProps={{
            className: "text-primary",
          }}
        >
          <Icon size={24} className="text-current" /> 
          
          <span className="text-[12px] font-medium text-current">
            {label}
          </span>
        </Link>
      ))}
    </nav>
  );
}

export default Tabs;