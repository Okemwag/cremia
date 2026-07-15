import type { Candle } from "../../features/platform/services/synexApi";

type SparklineProps = {
  candles: Candle[];
  className?: string;
};

export default function Sparkline({ candles, className = "" }: SparklineProps) {
  if (!candles.length) return <div className={`animate-pulse rounded-2xl bg-black/[0.04] ${className}`} />;

  const closes = candles.map((item) => Number(item.close));
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const points = closes
    .map((value, index) => `${(index / Math.max(closes.length - 1, 1)) * 100},${44 - ((value - min) / span) * 40}`)
    .join(" ");
  const positive = closes[closes.length - 1] >= closes[0];
  const color = positive ? "#5c914d" : "#a94c42";
  const gradientID = positive ? "sparkline-up" : "sparkline-down";

  return (
    <svg viewBox="0 0 100 48" preserveAspectRatio="none" className={className} aria-label="Recent price movement">
      <defs>
        <linearGradient id={gradientID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".3" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,48 ${points} 100,48`} fill={`url(#${gradientID})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
