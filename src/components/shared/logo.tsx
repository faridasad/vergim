import headerLogo from "@/assets/images/header-logo.svg";
import onboardingLogo from "@/assets/images/onboarding.svg";
import { cn } from "@/lib/utils";

const LOGOS = {
  onboarding: {
    src: onboardingLogo,
    alt: "Welcome to App",
  },
  header: {
    src: headerLogo,
    alt: "App Header Logo",
  },
} as const;

type LogoVariant = keyof typeof LOGOS;

interface LogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  variant?: LogoVariant;
}

export function Logo({ 
  variant = "onboarding", 
  className, 
  ...props 
}: LogoProps) {
  
  const { src, alt } = LOGOS[variant];

  return (
    <img
      src={src}
      alt={alt}
      className={cn("object-contain", className)}
      decoding="async"
      {...props}
    />
  );
}