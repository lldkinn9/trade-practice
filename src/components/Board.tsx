import React, { useEffect, useState } from 'react';
import { Quote } from '../types/quiz';

interface BoardProps {
  currentPrice: number;
  bids: Quote[];
  asks: Quote[];
}

export const Board: React.FC<BoardProps> = ({ currentPrice, bids, asks }) => {
  const [prevPrice, setPrevPrice] = useState<number>(currentPrice);
  const [priceDirection, setPriceDirection] = useState<'UP' | 'DOWN' | 'STAY'>('STAY');
  const [flashClass, setFlashClass] = useState<string>('');

  useEffect(() => {
    if (currentPrice > prevPrice) {
      setFlashClass('flash-up-active');
      setPriceDirection('UP');
      const timer = setTimeout(() => setFlashClass(''), 500);
      setPrevPrice(currentPrice);
      return () => clearTimeout(timer);
    } else if (currentPrice < prevPrice) {
      setFlashClass('flash-down-active');
      setPriceDirection('DOWN');
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
    <div className="w-full bg-[#0b0716] border border-[#2d1b4e] rounded-xl p-3 select-none font-mono shadow-[0_0_15px_rgba(189,0,255,0.08)]">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-[#00f0ff] neon-text-cyan">板情報 (5気配)</span>
        <span className="text-[10px] text-slate-500">LIVE FEED</span>
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
                  className="absolute right-[50%] top-0 bottom-0 bg-[#f43f5e]/15 transition-all duration-300"
                  style={{ width: `${widthPct / 2}%` }}
                />
                
                {/* 売り注文数量 */}
                <div className="col-span-4 text-right pr-2 text-[#f43f5e] z-10 font-semibold font-mono">
                  {ask.volume.toLocaleString()}
                </div>
                
                {/* 気配値 */}
                <div className="col-span-4 text-center text-slate-300 z-10 bg-[#05020c]/60 border border-[#2d1b4e]/30 py-0.5 rounded">
                  {ask.price.toLocaleString()}
                </div>
                
                {/* 右側（空欄、買い板との対称性のためのスペース） */}
                <div className="col-span-4 z-10" />
              </div>
            );
          })}
        </div>

        {/* 現在値 (中心線) */}
        <div className={`grid grid-cols-12 h-8 items-center border-y border-[#bd00ff]/30 bg-[#120824]/30 my-1 transition-colors duration-300 ${flashClass}`}>
          <div className="col-span-4 text-[9px] text-[#00f0ff] px-2 font-mono tracking-wider font-bold">LAST PRICE</div>
          <div className={`col-span-4 text-center text-sm font-black z-10 ${
            priceDirection === 'UP' 
              ? 'text-[#f43f5e] text-shadow-[0_0_8px_rgba(244,63,94,0.3)]' 
              : priceDirection === 'DOWN'
              ? 'text-[#10b981] text-shadow-[0_0_8px_rgba(16,185,129,0.3)]'
              : 'text-slate-100'
          }`}>
            {currentPrice.toLocaleString()}
            {priceDirection === 'UP' && ' ▲'}
            {priceDirection === 'DOWN' && ' ▼'}
          </div>
          <div className="col-span-4 text-right text-[9px] text-slate-500 px-2 font-mono tracking-widest font-bold">STREAM</div>
        </div>

        {/* 買い気配 (Bids) */}
        <div className="flex flex-col gap-[1px]">
          {sortedBids.map((bid, idx) => {
            const widthPct = (bid.volume / maxVolume) * 100;
            return (
              <div key={`bid-${idx}`} className="grid grid-cols-12 h-6 items-center relative overflow-hidden">
                {/* 買い注文量バー（左寄せ） */}
                <div 
                  className="absolute left-[50%] top-0 bottom-0 bg-[#10b981]/15 transition-all duration-300"
                  style={{ width: `${widthPct / 2}%` }}
                />
                
                {/* 左側（空欄、売り板との対称性のためのスペース） */}
                <div className="col-span-4 z-10" />
                
                {/* 気配値 */}
                <div className="col-span-4 text-center text-slate-300 z-10 bg-[#05020c]/60 border border-[#2d1b4e]/30 py-0.5 rounded">
                  {bid.price.toLocaleString()}
                </div>
                
                {/* 買い注文数量 */}
                <div className="col-span-4 text-left pl-2 text-[#10b981] z-10 font-semibold font-mono">
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
