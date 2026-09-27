type Props = {
  size?: number;
  className?: string;
};

/**
 * The ASTRA mark, drawn as vectors so it stays crisp and repo-owned:
 * a star, two orbits, and one body out on the outer track.
 */
export function AstraMark({ size = 28, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="ASTRA 3D"
    >
      <g fill="none" stroke="currentColor">
        <ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="5.3"
          transform="rotate(-20 12 12)"
          strokeWidth="1.2"
          opacity="0.7"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="6.2"
          ry="3.1"
          transform="rotate(-20 12 12)"
          strokeWidth="0.9"
          opacity="0.3"
        />
      </g>
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <circle cx="3.1" cy="13.2" r="1.7" fill="#f0a343" />
    </svg>
  );
}
