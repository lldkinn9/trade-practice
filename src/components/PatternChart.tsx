import React from 'react';
import { CandlePattern } from '../types/quiz';

interface PatternChartProps {
  candles: CandlePattern[];
}

export const PatternChart: React.FC<PatternChartProps> = ({ candles }) => {
  const width = 320;
  const height = 200;
  const padding = { top: 30, right: 30, bottom: 30, left: 30 };

  // 描画エリアの幅と高さ
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // 全キャンドルの価格範囲を調べる
  const allPrices = candles.flatMap((c) => [c.open, c.close, c.high, c.low]);
  const minPrice = Math.min(...allPrices) - 10;
  const maxPrice = Math.max(...allPrices) + 10;
  const priceRange = maxPrice - minPrice;

  // 座標変換ヘルパー
  const getX = (index: number) => {
    const spacing = chartWidth / (candles.length || 1);
    return padding.left + spacing * index + spacing / 2;
  };

  const getY = (price: number) => {
    return padding.top + (1 - (price - minPrice) / priceRange) * chartHeight;
  };

  return (
    <div className="w-full flex justify-center bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[280px] h-auto overflow-visible">
        {/* 背景グリッド線 (サイバー感・トレーディングツール感の演出) */}
        <line x1={10} y1={height / 2} x2={width - 10} y2={height / 2} stroke="var(--card-border)" strokeWidth="0.8" strokeDasharray="3,3" />
        <line x1={width / 2} y1={10} x2={width / 2} y2={height - 10} stroke="var(--card-border)" strokeWidth="0.8" strokeDasharray="3,3" />

        {candles.map((candle, idx) => {
          const x = getX(idx);
          const yOpen = getY(candle.open);
          const yClose = getY(candle.close);
          const yHigh = getY(candle.high);
          const yLow = getY(candle.low);
          
          const isUp = candle.type === 'up';
          const color = isUp ? 'var(--up-color)' : 'var(--down-color)';
          const candleWidth = 22;

          return (
            <g key={idx}>
              {/* 日数ラベル (1日目, 2日目, 3日目) */}
              <text
                x={x}
                y={height - 5}
                fill="#64748b"
                fontSize="9"
                fontWeight="600"
                textAnchor="middle"
                className="font-sans"
              >
                {`${idx + 1}日目`}
              </text>

              {/* ヒゲ (High - Low) */}
              <line
                x1={x}
                y1={yHigh}
                x2={x}
                y2={yLow}
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* 実体 (Open - Close) */}
              <rect
                x={x - candleWidth / 2}
                y={Math.min(yOpen, yClose)}
                width={candleWidth}
                height={Math.max(4, Math.abs(yOpen - yClose))}
                fill={color}
                rx="2.5"
                stroke={color}
                strokeWidth="1"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
