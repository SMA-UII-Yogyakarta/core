interface BrandLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export default function BrandLogo({ variant = 'dark', className = '' }: BrandLogoProps) {
  /**
   * From Figma Login:
   * - Light variant: circle with bg-accent (Candlelight), text "UII" in white or primary
   * - Dark variant: circle with bg-primary (Bay of Many), text "UII" in white
   */
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo circle */}
      <div
        className={`
          w-[50px] h-[50px] rounded-full
          flex items-center justify-center
          ${isLight ? 'bg-accent' : 'bg-primary'}
        `.trim()}
      >
        <span
          className={`
            text-sm font-extrabold leading-none
            ${isLight ? 'text-primary' : 'text-white'}
          `.trim()}
        >
          UII
        </span>
      </div>

      {/* Brand text */}
      <div className="flex flex-col">
        <span
          className={`
            text-[11px] font-bold leading-tight
            ${isLight ? 'text-white' : 'text-primary'}
          `.trim()}
        >
          SMA UII
        </span>
        <span
          className={`
            text-[9px] leading-tight
            ${isLight ? 'text-white/70' : 'text-text-muted'}
          `.trim()}
        >
          YOGYAKARTA
        </span>
      </div>
    </div>
  );
}
