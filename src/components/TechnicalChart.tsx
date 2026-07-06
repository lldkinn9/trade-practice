import React, { useState, useMemo } from 'react';
import { ChartDataPoint } from '../types/quiz';
import { calculateMA, calculateRSI, calculateMACD, convertTo5Min } from '../lib/technicalIndicators';
import { Activity, BarChart2, TrendingUp } from 'lucide-react';

interface TechnicalChartProps {
  initialData: ChartDataPoint[];
  resultData?: ChartDataPoint[];
  showResult?: boolean;
}

export const TechnicalChart: React.FC<TechnicalChartProps> = ({
  initialData,
  resultData = [],
  showResult = false,
}) => {
  const [timeframe, setTimeframe] = useState<'1m' | '5m'>('1m');
  const [indicatorType, setIndicatorType] = useState<'RSI' | 'MACD'>('RSI');

  // 全1分足データを結合
  const all1mData = useMemo(() => {
    return [...initialData, ...resultData];
  }, [initialData, resultData]);

  // 現在のタイムフレームに応じたチャートデータを生成
  const chartDataWithIndicators = useMemo(() => {
    // タイムフレームの処理
    const rawData = timeframe === '1m' ? all1mData : convertTo5Min(all1mData);
    
    // インジケーター計算
    const ma = calculateMA(rawData);
    const rsi = calculateRSI(rawData, 14);
    const macd = calculateMACD(rawData);

    // 結合
    return rawData.map((d, i) => ({
      ...d,
      ma5: ma.ma5[i],
      ma25: ma.ma25[i],
      ma75: ma.ma75[i],
      rsi: rsi[i],
      macd: macd.macd[i],
      macdSignal: macd.signal[i],
      macdHist: macd.histogram[i],
      originalIndex: i, // 元のインデックス
    }));
  }, [timeframe, all1mData]);

  // 表示用データの抽出
  const visibleData = useMemo(() => {
    const totalLen = chartDataWithIndicators.length;
    // 回答前と回答後で表示本数を制御する
    // 1分足：回答前は最後の30本、回答後はそれに結果の10本を加えた40本
    // 5分足：回答前は最後の18本、回答後はそれに結果の2本を加えた20本
    
    const resultCount = timeframe === '1m' ? resultData.length : Math.ceil(resultData.length / 5);
    const initialCount = timeframe === '1m' ? 30 : 18;
    
    // 全データのうち、どこからどこまでを表示するか
    const endIdx = showResult 
      ? totalLen 
      : totalLen - resultCount;
    
    const startIdx = Math.max(0, endIdx - initialCount);
    
    return chartDataWithIndicators.slice(startIdx, endIdx);
  }, [chartDataWithIndicators, timeframe, showResult, resultData.length]);

  if (visibleData.length === 0) {
    return <div className="text-gray-400 text-center py-8">データなし</div>;
  }

  // レイアウト設定
  const width = 600;
  const mainHeight = 220;
  const indHeight = 80;
  const padding = { top: 15, right: 45, bottom: 20, left: 45 };

  // Y軸の価格範囲計算 (ローソク足 + MA)
  const prices = visibleData.flatMap((d) => {
    const list = [d.high, d.low, d.open, d.close];
    if (d.ma5) list.push(d.ma5);
    if (d.ma25) list.push(d.ma25);
    if (d.ma75) list.push(d.ma75);
    return list;
  });
  const minPrice = Math.min(...prices) * 0.999;
  const maxPrice = Math.max(...prices) * 1.001;
  const priceRange = maxPrice - minPrice;

  // 出来高最大値
  const maxVolume = Math.max(...visibleData.map((d) => d.volume));

  // RSI/MACDのY軸範囲
  let indMin = 0;
  let indMax = 100;
  if (indicatorType === 'MACD') {
    const macdVals = visibleData.flatMap((d) => [
      d.macd || 0,
      d.macdSignal || 0,
      d.macdHist || 0,
    ]);
    const maxVal = Math.max(...macdVals.map(Math.abs));
    indMin = -maxVal * 1.1;
    indMax = maxVal * 1.1;
  }
  const indRange = indMax - indMin;

  // 座標変換関数
  const getX = (index: number) => {
    const chartWidth = width - padding.left - padding.right;
    return padding.left + (index / (visibleData.length - 1 || 1)) * chartWidth;
  };

  const getPriceY = (price: number) => {
    const chartHeight = mainHeight - padding.top - padding.bottom;
    return padding.top + (1 - (price - minPrice) / priceRange) * chartHeight;
  };

  const getVolHeight = (volume: number) => {
    const maxVolHeight = 35; // 出来高の最大高さ
    return (volume / (maxVolume || 1)) * maxVolHeight;
  };

  const getIndY = (val: number) => {
    return (1 - (val - indMin) / (indRange || 1)) * indHeight;
  };

  // 価格目盛り (Y軸)
  const yTicks = Array.from({ length: 4 }, (_, i) => minPrice + (priceRange * i) / 3);

  // インジケーター目盛り (Y軸)
  const indTicks = indicatorType === 'RSI' ? [30, 50, 70] : [indMin * 0.5, 0, indMax * 0.5];

  // 境界線インデックス (回答前データの末尾)
  const boundaryIndex = visibleData.findIndex((d) => {
    // 1分足なら90本目が境界、5分足なら18本目が境界
    const border = timeframe === '1m' ? initialData.length : Math.ceil(initialData.length / 5);
    return d.originalIndex >= border;
  });

  // SVG用のMAパス生成ヘルパー
  const generateMaPath = (key: 'ma5' | 'ma25' | 'ma75') => {
    let path = '';
    visibleData.forEach((d, i) => {
      const val = d[key];
      if (val !== null && val !== undefined) {
        const x = getX(i);
        const y = getPriceY(val);
        path += `${i === 0 || !path ? 'M' : 'L'}${x},${y}`;
      }
    });
    return path;
  };

  // RSIパス
  const rsiPath = () => {
    let path = '';
    visibleData.forEach((d, i) => {
      const val = d.rsi;
      if (val !== null && val !== undefined) {
        const x = getX(i);
        const y = getIndY(val);
        path += `${i === 0 || !path ? 'M' : 'L'}${x},${y}`;
      }
    });
    return path;
  };

  // MACDパス
  const macdPath = () => {
    let path = '';
    visibleData.forEach((d, i) => {
      const val = d.macd;
      if (val !== null && val !== undefined) {
        const x = getX(i);
        const y = getIndY(val);
        path += `${i === 0 || !path ? 'M' : 'L'}${x},${y}`;
      }
    });
    return path;
  };

  const macdSignalPath = () => {
    let path = '';
    visibleData.forEach((d, i) => {
      const val = d.macdSignal;
      if (val !== null && val !== undefined) {
        const x = getX(i);
        const y = getIndY(val);
        path += `${i === 0 || !path ? 'M' : 'L'}${x},${y}`;
      }
    });
    return path;
  };

  return (
    <div className="w-full bg-[#0b0716] border border-[#2d1b4e] rounded-2xl p-4 select-none shadow-[0_0_20px_rgba(189,0,255,0.08)] flex flex-col gap-4">
      {/* チャートコントロールヘッダー */}
      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-900/60 pb-3">
        <div className="flex items-center gap-4">
          <div className="flex bg-[#120824] p-0.5 rounded-lg border border-[#2d1b4e]/60">
            <button
              onClick={() => setTimeframe('1m')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                timeframe === '1m'
                  ? 'bg-[#bd00ff] text-white shadow-[0_0_10px_rgba(189,0,255,0.4)]'
                  : 'text-slate-400 hover:text-[#00f0ff]'
              }`}
            >
              1分足
            </button>
            <button
              onClick={() => setTimeframe('5m')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                timeframe === '5m'
                  ? 'bg-[#bd00ff] text-white shadow-[0_0_10px_rgba(189,0,255,0.4)]'
                  : 'text-slate-400 hover:text-[#00f0ff]'
              }`}
            >
              5分足
            </button>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-yellow-400 inline-block"></span>
              MA5
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-cyan-400 inline-block"></span>
              MA25
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-fuchsia-400 inline-block"></span>
              MA75
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showResult && (
            <span className="text-[10px] bg-[#00f0ff]/10 text-[#00f0ff] px-2 py-0.5 rounded-full border border-[#00f0ff]/30 shadow-[0_0_8px_rgba(0,240,255,0.2)] font-mono">
              ANSWER OPENED
            </span>
          )}
          <div className="flex bg-[#120824] p-0.5 rounded-lg border border-[#2d1b4e]/60">
            <button
              onClick={() => setIndicatorType('RSI')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                indicatorType === 'RSI'
                  ? 'bg-[#00f0ff] text-black font-extrabold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-[#bd00ff]'
              }`}
            >
              RSI
            </button>
            <button
              onClick={() => setIndicatorType('MACD')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                indicatorType === 'MACD'
                  ? 'bg-[#00f0ff] text-black font-extrabold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-[#bd00ff]'
              }`}
            >
              MACD
            </button>
          </div>
        </div>
      </div>

      {/* メインチャート領域 (価格 + MA + 出来高) */}
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${mainHeight}`} className="w-full h-auto">
          {/* グリッド横線 */}
          {yTicks.map((tick, i) => (
            <line
              key={i}
              x1={padding.left}
              y1={getPriceY(tick)}
              x2={width - padding.right}
              y2={getPriceY(tick)}
              stroke="#1b122c"
              strokeWidth="0.5"
            />
          ))}

          {/* 右軸価格目盛り */}
          {yTicks.map((tick, i) => (
            <text
              key={i}
              x={width - padding.right + 5}
              y={getPriceY(tick) + 3}
              fill="#94a3b8"
              fontSize="9"
              textAnchor="start"
              className="font-mono"
            >
              {Math.round(tick).toLocaleString()}
            </text>
          ))}

          {/* 解答境界線 */}
          {boundaryIndex !== -1 && (
            <g>
              <line
                x1={getX(boundaryIndex - 0.5)}
                y1={padding.top}
                x2={getX(boundaryIndex - 0.5)}
                y2={mainHeight - padding.bottom}
                stroke="#00f0ff"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <text
                x={getX(boundaryIndex - 0.5) - 4}
                y={padding.top + 8}
                fill="#00f0ff"
                fontSize="8"
                textAnchor="end"
                fontWeight="bold"
                className="font-mono tracking-wider"
              >
                予測時点
              </text>
            </g>
          )}

          {/* 出来高描画 (メインチャートの底に半透明で配置) */}
          {visibleData.map((d, i) => {
            const x = getX(i);
            const vHeight = getVolHeight(d.volume);
            const y = mainHeight - padding.bottom - vHeight;
            const barWidth = Math.max(1, ((width - padding.left - padding.right) / visibleData.length) * 0.6);
            const isUp = d.close >= d.open;
            const isResult = boundaryIndex !== -1 && i >= boundaryIndex;

            return (
              <rect
                key={`vol-${i}`}
                x={x - barWidth / 2}
                y={y}
                width={barWidth}
                height={vHeight}
                fill={isUp ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)'}
                stroke={isResult ? 'rgba(0, 240, 255, 0.3)' : 'none'}
                strokeWidth={isResult ? 0.5 : 0}
              />
            );
          })}

          {/* 移動平均線を描画 */}
          <path
            d={generateMaPath('ma5')}
            fill="none"
            stroke="#facc15"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all"
          />
          <path
            d={generateMaPath('ma25')}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all"
          />
          <path
            d={generateMaPath('ma75')}
            fill="none"
            stroke="#e879f9"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all"
          />

          {/* ローソク足描画 */}
          {visibleData.map((d, i) => {
            const x = getX(i);
            const yOpen = getPriceY(d.open);
            const yClose = getPriceY(d.close);
            const yHigh = getPriceY(d.high);
            const yLow = getPriceY(d.low);

            const isUp = d.close >= d.open;
            const color = isUp ? '#f43f5e' : '#10b981'; // 陽線＝赤, 陰線＝緑
            const barWidth = Math.max(2, ((width - padding.left - padding.right) / visibleData.length) * 0.7);
            const isResult = boundaryIndex !== -1 && i >= boundaryIndex;

            return (
              <g key={`candle-${i}`}>
                {/* 芯 */}
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray={isResult ? '2,2' : 'none'}
                />
                {/* 実体 */}
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

          {/* 時間軸ラベル */}
          {visibleData.map((d, i) => {
            if (i % Math.ceil(visibleData.length / 5) === 0) {
              return (
                <text
                  key={`time-${i}`}
                  x={getX(i)}
                  y={mainHeight - 5}
                  fill="#64748b"
                  fontSize="8.5"
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

      {/* サブチャート領域 (RSI or MACD) */}
      <div className="bg-[#05020c] border border-[#1b122c] rounded-xl p-2 relative shadow-[inset_0_0_10px_rgba(189,0,255,0.05)]">
        <div className="absolute top-1 left-2 flex items-center gap-1.5 text-[9px] font-bold text-slate-400 tracking-wider">
          <Activity className="w-3 h-3 text-slate-500" />
          <span>{indicatorType} INDICATOR</span>
        </div>

        <svg viewBox={`0 0 ${width} ${indHeight}`} className="w-full h-auto">
          {/* 目盛り基準線 */}
          {indicatorType === 'RSI' ? (
            <>
              {/* RSI 30% / 70% 基準線 */}
              <line x1={padding.left} y1={getIndY(70)} x2={width - padding.right} y2={getIndY(70)} stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="3,3" />
              <line x1={padding.left} y1={getIndY(30)} x2={width - padding.right} y2={getIndY(30)} stroke="#10b981" strokeWidth="0.5" strokeDasharray="3,3" />
              <line x1={padding.left} y1={getIndY(50)} x2={width - padding.right} y2={getIndY(50)} stroke="#334155" strokeWidth="0.5" />
              
              <text x={width - padding.right + 5} y={getIndY(70) + 3} fill="#f43f5e" fontSize="8" className="font-mono">70</text>
              <text x={width - padding.right + 5} y={getIndY(30) + 3} fill="#10b981" fontSize="8" className="font-mono">30</text>
            </>
          ) : (
            <>
              {/* MACD 0基準線 */}
              <line x1={padding.left} y1={getIndY(0)} x2={width - padding.right} y2={getIndY(0)} stroke="#475569" strokeWidth="0.5" />
              <text x={width - padding.right + 5} y={getIndY(0) + 3} fill="#94a3b8" fontSize="8" className="font-mono">0.0</text>
            </>
          )}

          {/* 解答境界線 (サブチャート側) */}
          {boundaryIndex !== -1 && (
            <line
              x1={getX(boundaryIndex - 0.5)}
              y1={5}
              x2={getX(boundaryIndex - 0.5)}
              y2={indHeight - 5}
              stroke="#00f0ff"
              strokeWidth="1.2"
              strokeDasharray="4,4"
            />
          )}

          {/* RSI描画 */}
          {indicatorType === 'RSI' && (
            <path
              d={rsiPath()}
              fill="none"
              stroke="#00f0ff"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* MACD描画 */}
          {indicatorType === 'MACD' && (
            <>
              {/* ヒストグラム (棒グラフ) */}
              {visibleData.map((d, i) => {
                const val = d.macdHist;
                if (val === null || val === undefined) return null;
                const x = getX(i);
                const y0 = getIndY(0);
                const yVal = getIndY(val);
                const barWidth = Math.max(1.5, ((width - padding.left - padding.right) / visibleData.length) * 0.4);
                const isPositive = val >= 0;

                return (
                  <rect
                    key={`hist-${i}`}
                    x={x - barWidth / 2}
                    y={isPositive ? yVal : y0}
                    width={barWidth}
                    height={Math.max(1, Math.abs(yVal - y0))}
                    fill={isPositive ? 'rgba(244, 63, 94, 0.45)' : 'rgba(16, 185, 129, 0.45)'}
                  />
                );
              })}

              {/* MACD線 (シアン) */}
              <path
                d={macdPath()}
                fill="none"
                stroke="#00f0ff"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* シグナル線 (紫) */}
              <path
                d={macdSignalPath()}
                fill="none"
                stroke="#bd00ff"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
};
