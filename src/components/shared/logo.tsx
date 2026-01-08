import innalokLogo from "@/assets/images/innalok logo.svg";
import { cn } from "@/lib/utils";

const LOGOS = {
  onboarding: {
    src: innalokLogo,
    alt: "Innalok Logo",
  },
  header: {
    src: innalokLogo,
    alt: "Innalok Logo",
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