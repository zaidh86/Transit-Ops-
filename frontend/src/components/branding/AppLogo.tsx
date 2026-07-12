import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  href?: string;
  size?: number;
  showLabel?: boolean;
  labelClassName?: string;
  className?: string;
}

export function AppLogo({
  href = "/",
  size = 32,
  showLabel = true,
  labelClassName,
  className,
}: AppLogoProps) {
  const logo = (
    <>
      <span
        className={cn(
          "relative inline-flex shrink-0 overflow-hidden rounded-md border border-border bg-background",
          className
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src="/favicon.ico"
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
          priority
        />
      </span>
      {showLabel && (
        <span className={cn("font-display font-semibold tracking-tight", labelClassName)}>
          TransitOps
        </span>
      )}
    </>
  );

  if (!href) {
    return <div className="flex items-center gap-2">{logo}</div>;
  }

  return (
    <Link href={href} className="flex items-center gap-2">
      {logo}
    </Link>
  );
}