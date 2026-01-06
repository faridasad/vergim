import { Link } from "@tanstack/react-router";
import { Logo } from "../shared/logo";
import { Button } from "../shared/button";
import { BellRing, Settings } from "lucide-react";
import { useState } from "react";
import { Select } from "@/components/shared/select";

const RESTAURANTS = [
  { label: "Restaurant A", value: "restaurant_a" },
  { label: "Restaurant B", value: "restaurant_b" },
  { label: "Restaurant C", value: "restaurant_c" },
];

function Header() {
  const [restaurant, setRestaurant] = useState<string>("restaurant_a");
  return (
    <header className="px-4 flex items-center justify-between mt-6">
      <Link to="/home" className="flex items-center">
        <Logo variant="header" className="h-6.75 object-contain" />
        <span className="text-[14px] text-foreground">invoys</span>
      </Link>

{/*       <div className="flex items-center gap-2">
        <Select
          options={RESTAURANTS}
          value={restaurant}
          onChange={setRestaurant}
          placeholder="Select Store"
          className="w-full bg-background text-[14px] h-8"
          variant="ghost"
        />
        <Button variant="inverse" className="w-8 h-8">
          <BellRing className="text-foreground" />
        </Button>
        <Button variant="inverse" className="w-8 h-8">
          <Settings className="text-foreground" />
        </Button>
      </div> */}
    </header>
  );
}

export default Header;
