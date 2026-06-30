import React from 'react';
import { ChartDataPoint } from '../types/quiz';

interface MiniChartProps {
  initialData: ChartDataPoint[];
  resultData?: ChartDataPoint[];
  showResult?: boolean;
}

export const MiniChart: React.FC<MiniChartProps> = ({
  initialData,
  resultData = [],
  showResult = false,
}) => {
  // 表示するすべてのデータを結合
  const data = showResult ? [...initialData, ...resultData] : initialData;

  if (data.length === 0) return <div className="text-gray-400 text-center py-8">データなし</div>;

  // チャートの高さ・幅
  const width = 500;
  const height = 220;
  const padding = { top: 15, right: 10, bottom: 20, left: 45 };

  // 出来高用の高さ
  const volumeHeight = 40;

  // 価格の最小・最大を計算
  const prices = data.flatMap((d) => [d.high, d.low, d.open, d.close]);
  const minPrice = Math.min(...prices) * 0.9995;
  const maxPrice = Math.max(...prices) * 1.0005;
  const priceRange = maxPrice - minPrice;

  // 出来高の最大を計算
  const maxVolume = Math.max(...data.map((d) => d.volume));

  // 座標変換ヘルパー
  const getX = (index: number) => {
    const chartWidth = width - padding.left - padding.right;
    return padding.left + (index / (data.length - 1 || 1)) * chartWidth;
  };

  const getY = (price: number) => {
    const chartHeight = height - padding.top - padding.bottom - volumeHeight;
    return padding.top + (1 - (price - minPrice) / priceRange) * chartHeight;
  };

  const getVolumeY = (volume: number) => {
    const yBaseline = height - padding.bottom;
    const ratio = volume / (maxVolume || 1);
    return yBaseline - ratio * volumeHeight;
  };

  // 目盛り用の価格を計算 (4段階)
  const yTicks = Array.from({ length: 4 }, (_, i) => minPrice + (priceRange * i) / 3);

  // 初期のデータの長さ
  const initialLength = initialData.length;

  return (
    <div className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 select-none">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-slate-400">1分足チャート</span>
        {showResult && (
          <span className="text-[10px] bg-[#ef4444]/20 text-[#ef4444] px-1.5 py-0.5 rounded border border-[#ef4444]/30 font-medium">
            回答後データ開示中
          </span>
        )}
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* グリッド線 (横線) */}
          {yTicks.map((tick, i) => (
            <line
              key={i}
              x1={padding.left}
              y1={getY(tick)}
              x2={width - padding.right}
              y2={getY(tick)}
              stroke="var(--card-border)"
              strokeWidth="0.5"
            />
          ))}

          {/* グリッドラベル (Y軸価格) */}
          {yTicks.map((tick, i) => (
            <text
              key={i}
              x={padding.left - 5}
              y={getY(tick) + 3}
              fill="#64748b"
              fontSize="9"
              textAnchor="end"
              className="font-mono"
            >
              {Math.round(tick).toLocaleString()}
            </text>
          ))}

          {/* 解答境界線の描画 */}
          {showResult && resultData.length > 0 && (
            <line
              x1={getX(initialLength - 0.5)}
              y1={padding.top}
              x2={getX(initialLength - 0.5)}
              y2={height - padding.bottom}
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeDasharray="3,3"
            />
          )}

          {/* 出来高描画 */}
          {data.map((d, i) => {
            const x = getX(i);
            const y = getVolumeY(d.volume);
            const barWidth = Math.max(1, (width - padding.left - padding.right) / data.length * 0.6);
            const isUp = d.close >= d.open;
            const isResult = i >= initialLength;
            
            return (
              <rect
                key={`vol-${i}`}
                x={x - barWidth / 2}
                y={y}
                width={barWidth}
                height={Math.max(1, height - padding.bottom - y)}
                fill={isUp ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}
                stroke={isResult ? '#3b82f6' : 'none'}
                strokeWidth={isResult ? 0.5 : 0}
                strokeDasharray={isResult ? '1,1' : 'none'}
              />
            );
          })}

          {/* ローソク足描画 */}
          {data.map((d, i) => {
            const x = getX(i);
            const yOpen = getY(d.open);
            const yClose = getY(d.close);
            const yHigh = getY(d.high);
            const yLow = getY(d.low);

            const isUp = d.close >= d.open;
            const color = isUp ? 'var(--up-color)' : 'var(--down-color)';
            const barWidth = Math.max(2, (width - padding.left - padding.right) / data.length * 0.7);
            const isResult = i >= initialLength;

            return (
              <g key={`candle-${i}`}>
                {/* ヒゲ (High - Low) */}
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray={isResult ? '2,2' : 'none'}
                />
                {/* 実体 (Open - Close) */}
                <rect
                  x={x - barWidth / 2}
                  y={Math.min(yOpen, yClose)}
                  width={barWidth}
                  height={Math.max(1.5, Math.abs(yOpen - yClose))}
                  fill={isResult ? 'none' : color}
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray={isResult ? '2,2' : 'none'}
                />
              </g>
            );
          })}

          {/* 時間軸のラベル (一部のみ表示) */}
          {data.map((d, i) => {
            if (i % Math.ceil(data.length / 5) === 0) {
              return (
                <text
                  key={`time-${i}`}
                  x={getX(i)}
                  y={height - 5}
                  fill="#64748b"
                  fontSize="9"
                  textAnchor="middle"
                  className="font-mono"
                >
                  {d.time}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
};
