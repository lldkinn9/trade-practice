import React, { useEffect, useState } from 'react';
import { Quote } from '../types/quiz';

interface BoardProps {
  currentPrice: number;
  bids: Quote[];
  asks: Quote[];
}

export const Board: React.FC<BoardProps> = ({ currentPrice, bids, asks }) => {
  const [prevPrice, setPrevPrice] = useState<number>(currentPrice);
  const [flashClass, setFlashClass] = useState<string>('');

  useEffect(() => {
    if (currentPrice > prevPrice) {
      setFlashClass('flash-up-active');
      const timer = setTimeout(() => setFlashClass(''), 500);
      setPrevPrice(currentPrice);
      return () => clearTimeout(timer);
    } else if (currentPrice < prevPrice) {
      setFlashClass('flash-down-active');
      const timer = setTimeout(() => setFlashClass(''), 500);
      setPrevPrice(currentPrice);
      return () => clearTimeout(timer);
    }
  }, [currentPrice, prevPrice]);

  // 板の注文数量の最大値を計算（バーの幅のスケール用）
  const allQuotes = [...bids, ...asks];
  const maxVolume = Math.max(...allQuotes.map((q) => q.volume), 1);

  // 売り板は上から順に安くなるので、描画順は asks の逆順（高い価格が上）にすると直感的
  // 例: asks=[{price: 100, volume: 10}, {price: 101, volume: 20}]
  // 描画は 101 (上) -> 100 (下)
  const sortedAsks = [...asks].sort((a, b) => b.price - a.price);
  const sortedBids = [...bids].sort((a, b) => b.price - a.price);

  return (
    <div className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 select-none font-mono">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-slate-400">板情報 (5気配)</span>
        <span className="text-[10px] text-slate-500">リアルタイム板</span>
      </div>

      <div className="flex flex-col text-xs">
        {/* 売り気配 (Asks) */}
        <div className="flex flex-col gap-[1px]">
          {sortedAsks.map((ask, idx) => {
            const widthPct = (ask.volume / maxVolume) * 100;
            return (
              <div key={`ask-${idx}`} className="grid grid-cols-12 h-6 items-center relative overflow-hidden">
                {/* 売り注文量バー（右寄せ） */}
                <div 
                  className="absolute right-[50%] top-0 bottom-0 bg-[#ef4444]/10 transition-all duration-300"
                  style={{ width: `${widthPct / 2}%` }}
                />
                
                {/* 売り注文数量 */}
                <div className="col-span-4 text-right pr-2 text-[#ef4444] z-10 font-semibold">
                  {ask.volume.toLocaleString()}
                </div>
                
                {/* 気配値 */}
                <div className="col-span-4 text-center text-slate-300 z-10 bg-[var(--background)]/50 py-0.5 rounded">
                  {ask.price.toLocaleString()}
                </div>
                
                {/* 右側（空欄、買い板との対称性のためのスペース） */}
                <div className="col-span-4 z-10" />
              </div>
            );
          })}
        </div>

        {/* 現在値 (中心線) */}
        <div className={`grid grid-cols-12 h-8 items-center border-y border-[var(--card-border)] my-1 transition-colors duration-300 ${flashClass}`}>
          <div className="col-span-4 text-[10px] text-slate-400 px-2">現在値</div>
          <div className={`col-span-4 text-center text-sm font-bold z-10 ${
            currentPrice >= prevPrice ? 'text-[#ef4444]' : 'text-[#10b981]'
          }`}>
            {currentPrice.toLocaleString()}
            {currentPrice > prevPrice && ' ▲'}
            {currentPrice < prevPrice && ' ▼'}
          </div>
          <div className="col-span-4 text-right text-[10px] text-slate-400 px-2 font-sans">TICK STREAM</div>
        </div>

        {/* 買い気配 (Bids) */}
        <div className="flex flex-col gap-[1px]">
          {sortedBids.map((bid, idx) => {
            const widthPct = (bid.volume / maxVolume) * 100;
            return (
              <div key={`bid-${idx}`} className="grid grid-cols-12 h-6 items-center relative overflow-hidden">
                {/* 買い注文量バー（左寄せ） */}
                <div 
                  className="absolute left-[50%] top-0 bottom-0 bg-[#10b981]/10 transition-all duration-300"
                  style={{ width: `${widthPct / 2}%` }}
                />
                
                {/* 左側（空欄、売り板との対称性のためのスペース） */}
                <div className="col-span-4 z-10" />
                
                {/* 気配値 */}
                <div className="col-span-4 text-center text-slate-300 z-10 bg-[var(--background)]/50 py-0.5 rounded">
                  {bid.price.toLocaleString()}
                </div>
                
                {/* 買い注文数量 */}
                <div className="col-span-4 text-left pl-2 text-[#10b981] z-10 font-semibold">
                  {bid.volume.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
