import React from "react";

export type IconProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

export const ArrowBackOutline: React.FC<IconProps> = ({
  size = 20,
  className,
  style,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="48"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M244 400L100 256l144-144M120 256h292" />
  </svg>
);

export const ChevronForwardOutline: React.FC<IconProps> = ({
  size = 18,
  className,
  style,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="48"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M184 112l144 144-144 144" />
  </svg>
);

export const BluetoothIcon: React.FC<IconProps> = ({
  size = 18,
  className,
  style,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    style={style}
  >
    <path d="M388 160.77a20 20 0 00-5.85-14.91l-112-112A20 20 0 00236 48v164.52l-79-67.71a20 20 0 00-26 30.38L225.27 256 131 336.81a20 20 0 1026 30.38l79-67.71V464a20 20 0 0034.14 14.14l112-112a20 20 0 00-1.14-29.33L286.73 256 381 175.19a20 20 0 007-14.42zm-49.42 192.36L276 415.72V299.49zM276 212.52V96.28l62.59 62.59z" />
  </svg>
);

export const WarningIcon: React.FC<IconProps> = ({
  size = 18,
  className,
  style,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    style={style}
  >
    <path d="M449.07 399.08L278.64 82.58c-12.08-22.44-44.26-22.44-56.35 0L51.87 399.08A32 32 0 0080 446.25h340.89a32 32 0 0028.18-47.17zm-198.6-1.83a20 20 0 1120-20 20 20 0 01-20 20zm21.72-201.15l-5.74 122a16 16 0 01-32 0l-5.74-121.95a21.73 21.73 0 0121.5-22.69h.21a21.74 21.74 0 0121.73 22.7z" />
  </svg>
);

type BatteryProps = IconProps & { fillLevel?: "full" | "half" | "empty" };

const BatteryShell: React.FC<IconProps> = ({ size = 36, className, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    className={className}
    style={style}
  >
    <rect
      x="32"
      y="144"
      width="400"
      height="224"
      rx="45.7"
      ry="45.7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeMiterlimit="10"
      strokeWidth="32"
    />
    <path
      d="M480 218.67v74.66"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeMiterlimit="10"
      strokeWidth="32"
    />
  </svg>
);

export const BatteryFullOutline: React.FC<IconProps> = ({
  size = 36,
  className,
  style,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    className={className}
    style={style}
  >
    <rect
      x="32"
      y="144"
      width="400"
      height="224"
      rx="45.7"
      ry="45.7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeMiterlimit="10"
      strokeWidth="32"
    />
    <rect
      x="85.69"
      y="198.93"
      width="292.63"
      height="114.14"
      rx="4"
      ry="4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeMiterlimit="10"
      strokeWidth="32"
    />
    <path
      d="M480 218.67v74.66"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeMiterlimit="10"
      strokeWidth="32"
    />
  </svg>
);

export const BatteryHalfOutline: React.FC<IconProps> = ({
  size = 36,
  className,
  style,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    className={className}
    style={style}
  >
    <rect
      x="32"
      y="144"
      width="400"
      height="224"
      rx="45.7"
      ry="45.7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeMiterlimit="10"
      strokeWidth="32"
    />
    <rect
      x="85.69"
      y="198.93"
      width="154.31"
      height="114.13"
      rx="4"
      ry="4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeMiterlimit="10"
      strokeWidth="32"
    />
    <path
      d="M480 218.67v74.66"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeMiterlimit="10"
      strokeWidth="32"
    />
  </svg>
);

export const BatteryDeadOutline: React.FC<IconProps> = ({
  size = 36,
  className,
  style,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    className={className}
    style={style}
  >
    <rect
      x="31"
      y="144"
      width="400"
      height="224"
      rx="45.7"
      ry="45.7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeMiterlimit="10"
      strokeWidth="32"
    />
    <path
      d="M479 218.67v74.66"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeMiterlimit="10"
      strokeWidth="32"
    />
  </svg>
);

export const BatteryDead: React.FC<IconProps> = BatteryDeadOutline;
