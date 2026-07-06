import React, { useState, useEffect, useRef } from 'react';
import { Quiz, TickStreamDataPoint, Execution } from '../types/quiz';
import { TechnicalChart } from './TechnicalChart';
import { Board } from './Board';
import { Play, Pause, RotateCcw, Eye, EyeOff, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PlayScreenProps {
  quiz: Quiz;
  onAnswer: (answer: 'UP' | 'DOWN' | 'STAY') => void;
  onBack: () => void;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({ quiz, onAnswer, onBack }) => {
  // アニメーション再生状態
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentSec, setCurrentSec] = useState<number>(0);
  const [hideSymbol, setHideSymbol] = useState<boolean>(true);
  
  // 経過時間タイマー
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const maxSec = quiz.tick_stream_data.length - 1;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  // 1秒刻みのアニメーション制御
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentSec((prev) => {
          if (prev >= maxSec) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, maxSec]);

  // 経過時間タイマーの制御
  useEffect(() => {
    elapsedTimerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  // 現在表示すべきストリームデータのスナップショット
  const currentSnapshot: TickStreamDataPoint = quiz.tick_stream_data[currentSec] || {
    timestamp: currentSec,
    current_price: quiz.initial_chart_data[quiz.initial_chart_data.length - 1]?.close || 0,
    bids: [],
    asks: [],
    executions: [],
  };

  // 0秒から現在秒までの歩み値を統合して表示する
  const accumulatedExecutions: Execution[] = [];
  for (let i = 0; i <= currentSec; i++) {
    const step = quiz.tick_stream_data[i];
    if (step && step.executions) {
      accumulatedExecutions.push(...step.executions);
    }
  }

  // 歩み値ログが追加されたらコンテナ内を一番下までスクロール
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [currentSec]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setCurrentSec(0);
    setIsPlaying(true);
  };

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-4 py-2 animate-fade-in text-white max-w-4xl mx-auto">
      {/* 上部ヘッダー */}
      <div className="flex justify-between items-center bg-[#0b0716] border border-[#2d1b4e] rounded-xl px-4 py-3 shadow-[0_0_15px_rgba(189,0,255,0.1)]">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">銘柄</span>
              <button 
                onClick={() => setHideSymbol(!hideSymbol)}
                className="text-slate-500 hover:text-[#00f0ff] transition-colors"
                title={hideSymbol ? "銘柄名を表示" : "銘柄名を隠す"}
              >
                {hideSymbol ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-sm font-black tracking-widest font-mono text-[#00f0ff] neon-text-cyan">
              {hideSymbol ? 'MOCK_ASSET_A' : `${quiz.name} (${quiz.symbol})`}
            </div>
          </div>
          {/* 回答へのバイアスを避けるため、銘柄名やパターンは回答後に開示します */}
        </div>

        <div className="flex items-center gap-2 bg-[#05020c] px-3 py-1.5 rounded-lg border border-[#bd00ff]/30 font-mono text-xs text-slate-300 shadow-[0_0_8px_rgba(189,0,255,0.15)]">
          <Clock className="w-3.5 h-3.5 text-[#00f0ff]" />
          <span>ELAPSED:</span>
          <span className="font-bold text-white">{formatElapsed(elapsedTime)}</span>
        </div>
      </div>

      {/* メインレイアウト: チャートと板情報 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* 左側: ミニチャート */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <TechnicalChart initialData={quiz.initial_chart_data} showResult={false} />
          
          {/* 歩み値 (出来高・歩み値ログ) */}
          <div className="bg-[#0b0716] border border-[#1f1235] rounded-lg p-3 flex flex-col h-48 shadow-[0_0_10px_rgba(0,240,255,0.02)]">
            <span className="text-xs font-semibold text-slate-400 mb-2">歩み値ログ</span>
            <div ref={logContainerRef} className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1 font-mono text-[11px]">
              {accumulatedExecutions.length === 0 ? (
                <div className="text-slate-600 text-center py-8">約定なし</div>
              ) : (
                accumulatedExecutions.map((exec, idx) => (
                  <div key={idx} className="grid grid-cols-3 py-0.5 border-b border-slate-900/40 hover:bg-slate-800/30 px-1 rounded transition-colors">
                    <span className="text-slate-500">{exec.time}</span>
                    <span className={exec.type === 'BUY' ? 'text-[#ef4444] font-semibold' : exec.type === 'SELL' ? 'text-[#10b981] font-semibold' : 'text-slate-300'}>
                      {exec.price.toLocaleString()}
                    </span>
                    <span className={`text-right ${exec.volume >= 1000 ? 'text-yellow-500 font-bold' : 'text-slate-400'}`}>
                      {exec.volume.toLocaleString()} 株
                      {exec.volume >= 1000 && ' 💥'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 右側: 板情報 */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <Board
            currentPrice={currentSnapshot.current_price}
            bids={currentSnapshot.bids}
            asks={currentSnapshot.asks}
          />
        </div>
      </div>

      {/* アニメーションコントローラー */}
      <div className="bg-[#0b0716] border border-[#2d1b4e] rounded-xl p-4 flex flex-col gap-3 shadow-[0_0_15px_rgba(189,0,255,0.05)]">
        <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
          <span>ORDERBOOK STREAM (10s)</span>
          <span className="text-[#00f0ff] font-semibold">{currentSec}s / {maxSec}s</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* 再生/一時停止 */}
          <button
            onClick={handlePlayPause}
            className="p-2 bg-[#bd00ff] hover:bg-[#d946ef] text-white rounded-lg transition-all flex items-center justify-center shadow-[0_0_10px_rgba(189,0,255,0.4)] cursor-pointer"
            title={isPlaying ? "一時停止" : "再生"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          {/* リセット */}
          <button
            onClick={handleReset}
            className="p-2 bg-[#1f1235] hover:bg-[#2d1b4e] text-slate-300 border border-[#bd00ff]/30 hover:border-[#bd00ff]/80 rounded-lg transition-all flex items-center justify-center cursor-pointer"
            title="最初から再生"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* シークバー */}
          <input
            type="range"
            min="0"
            max={maxSec}
            value={currentSec}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentSec(Number(e.target.value));
            }}
            className="flex-1 h-1.5 bg-[#05020c] rounded-lg appearance-none cursor-pointer accent-[#bd00ff]"
          />
        </div>
      </div>

      {/* 解答ボタンセクション */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mt-2">
        <button
          onClick={() => onAnswer('UP')}
          className="flex flex-col items-center justify-center gap-1.5 py-3 md:py-4 bg-[#f43f5e] hover:bg-[#ff5572] active:scale-95 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 border border-rose-500/30 hover:border-[#00f0ff] cursor-pointer"
        >
          <TrendingUp className="w-5 h-5 md:w-6 md:h-6 stroke-[3px]" />
          <span className="text-xs md:text-base tracking-wider font-sans font-extrabold">上昇 (UP)</span>
          <span className="text-[9px] opacity-75 font-normal text-center px-1 font-mono">変化率 +0.2%以上</span>
        </button>

        <button
          onClick={() => onAnswer('STAY')}
          className="flex flex-col items-center justify-center gap-1.5 py-3 md:py-4 bg-[#1a0f30] hover:bg-[#2d1553] active:scale-95 text-slate-100 font-bold rounded-xl transition-all duration-200 border border-[#bd00ff]/50 hover:border-[#bd00ff] hover:shadow-[0_0_15px_rgba(189,0,255,0.3)] cursor-pointer"
        >
          <Minus className="w-5 h-5 md:w-6 md:h-6 stroke-[3px] text-[#00f0ff]" />
          <span className="text-xs md:text-base tracking-wider font-sans font-extrabold">横ばい (STAY)</span>
          <span className="text-[9px] opacity-75 font-normal text-center px-1 font-mono">変化率 -0.2%〜+0.2%</span>
        </button>

        <button
          onClick={() => onAnswer('DOWN')}
          className="flex flex-col items-center justify-center gap-1.5 py-3 md:py-4 bg-[#10b981] hover:bg-[#05d993] active:scale-95 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 border border-emerald-500/30 hover:border-[#00f0ff] cursor-pointer"
        >
          <TrendingDown className="w-5 h-5 md:w-6 md:h-6 stroke-[3px]" />
          <span className="text-xs md:text-base tracking-wider font-sans font-extrabold">下降 (DOWN)</span>
          <span className="text-[9px] opacity-75 font-normal text-center px-1 font-mono">変化率 -0.2%以下</span>
        </button>
      </div>

      {/* 戻るボタン */}
      <button 
        onClick={onBack}
        className="text-center text-xs text-slate-500 hover:text-[#00f0ff] transition-colors mt-2 underline"
      >
        トレーニングメニューに戻る
      </button>
    </div>
  );
};
