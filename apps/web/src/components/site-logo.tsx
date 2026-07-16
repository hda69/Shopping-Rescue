import Image from 'next/image';
import Link from 'next/link';

const ICON_SIZE_CLASSES = {
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
  hero: 'h-24 w-24 sm:h-28 sm:w-28',
} as const;

interface SiteLogoProps {
  href?: string;
  size?: keyof typeof ICON_SIZE_CLASSES;
  className?: string;
  priority?: boolean;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`text-lg font-bold tracking-tight ${className}`.trim()}>
      <span className="text-[#111]">Shopping </span>
      <span className="bg-gradient-to-r from-[#7c6cff] to-[#ff8a5c] bg-clip-text text-transparent">
        Rescue
      </span>
    </span>
  );
}

export function SiteLogo({
  href = '/',
  size = 'md',
  className = '',
  priority = false,
  showWordmark = size !== 'hero',
  wordmarkClassName = '',
}: SiteLogoProps) {
  const icon = (
    <Image
      src="/logo-icon.png"
      alt=""
      width={512}
      height={512}
      priority={priority}
      aria-hidden
      className={`${ICON_SIZE_CLASSES[size]} shrink-0 object-contain ${className}`.trim()}
    />
  );

  const content = showWordmark ? (
    <span className="inline-flex items-center gap-2.5">
      {icon}
      <Wordmark
        className={
          wordmarkClassName ||
          (size === 'sm' ? 'hidden sm:inline text-base' : '')
        }
      />
    </span>
  ) : (
    icon
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="Shopping Rescue">
      {content}
    </Link>
  );
}
