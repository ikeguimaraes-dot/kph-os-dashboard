interface SparklineProps {
  values: number[];
  /** Cor da linha. Default: dourado. */
  color?: string;
  /** Altura em px (discreto). Default 32. */
  height?: number;
}

/**
 * Sparkline discreto em SVG puro — só a linha, sem eixos/grid/tooltip.
 * Estica na largura do card; stroke uniforme via non-scaling-stroke.
 */
export function Sparkline({
  values,
  color = "#C9A24B",
  height = 32,
}: SparklineProps) {
  if (!values || values.length < 2) return null;

  const W = 100; // viewBox horizontal (esticado por preserveAspectRatio="none")
  const H = 100; // viewBox vertical
  const pad = 6;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - pad - ((v - min) / span) * (H - pad * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden
      className="block"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
