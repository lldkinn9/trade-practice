import React, { useState, useEffect, useRef } from 'react';
import { learnSteps, LearnStep } from '../lib/learnData';
import { TechnicalChart } from './TechnicalChart';
import { Board } from './Board';
import { Play, Pause, RotateCcw, ArrowLeft, ArrowRight, Home, BookOpen, Clock, List } from 'lucide-react';

interface LearnModeScreenProps {
  onBackToHome: () => void;
}

// 簡易マークダウンパース関数
const renderConcept = (text: string) => {
  return text.split('\n').map((line, idx) => {
    if (line.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-sm font-black text-[#00f0ff] neon-text-cyan mt-4 mb-2 tracking-wider">
          {line.replace('### ', '')}
        </h3>
      );
    }
    if (line.startsWith('- ')) {
      const parts = line.replace('- ', '').split(':');
      if (parts.length > 1) {
        return (
          <li key={idx} className="ml-4 mb-1.5 list-disc leading-relaxed text-xs text-slate-300">
            <strong className="text-[#e879f9]">{parts[0]}:</strong>
            {parts.slice(1).join(':')}
          </li>
        );
      }
      return (
        <li key={idx} className="ml-4 mb-1.5 list-disc leading-relaxed text-xs text-slate-300">
          {line.replace('- ', '')}
        </li>
      );
    }
    if (line.trim() === '') {
      return <div key={idx} className="h-2" />;
    }
    // 番号付きリスト
    if (/^\d+\.\s/.test(line)) {
      const cleanLine = line.replace(/^\d+\.\s/, '');
      return (
        <h4 key={idx} className="text-xs font-bold text-white mt-3 mb-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#bd00ff] shadow-[0_0_6px_rgba(189,0,255,0.6)]"></span>
          {cleanLine}
        </h4>
      );
    }
    return (
      <p key={idx} className="text-xs leading-relaxed text-slate-400 mb-1">
        {line}
      </p>
    );
  });
};

export const LearnModeScreen: React.FC<LearnModeScreenProps> = ({ onBackToHome }) => {
  // 初期状態は目次表示のため null
  const [currentStepIdx, setCurrentStepIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentSec, setCurrentSec] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  const step = currentStepIdx !== null ? learnSteps[currentStepIdx] : null;
  const quiz = step?.quizData;
  const maxSec = quiz ? quiz.tick_stream_data.length - 1 : 0;

  // ステップが切り替わったらスクロール位置を最上部にリセットし、再生時間を0秒に戻す
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (currentStepIdx !== null) {
      setCurrentSec(0);
      setIsPlaying(true);
    }
  }, [currentStepIdx]);

  // 1秒刻みの板情報ストリーム自動再生（無限ループ）
  useEffect(() => {
    if (currentStepIdx !== null && isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentSec((prev) => {
          if (prev >= maxSec) {
            return 0; // ループ再生
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
  }, [isPlaying, maxSec, currentStepIdx]);



  // 歩み値ログ自動スクロール
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [currentSec, currentStepIdx]);

  const handleNextStep = () => {
    if (currentStepIdx !== null && currentStepIdx < learnSteps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx !== null && currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  // ハイライト用クラスの定義
  const getHighlightClass = (elementName: string) => {
    if (step && step.highlightElement === elementName) {
      return 'border-[#00f0ff] ring-2 ring-[#00f0ff]/50 shadow-[0_0_20px_rgba(0,240,255,0.25)] scale-[1.01] transition-all duration-500 z-10';
    }
    return 'opacity-60 transition-all duration-500 filter saturate-[0.8]';
  };

  // ==================== 1. 目次 (カリキュラムリスト) 画面の表示 ====================
  if (currentStepIdx === null) {
    return (
      <div className="flex flex-col gap-6 py-2 animate-fade-in text-white w-full max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center py-6 bg-gradient-to-b from-[#1b083a]/30 to-transparent border border-[#2d1b4e]/50 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_20px_rgba(189,0,255,0.05)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff]/5 rounded-full blur-3xl" />
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#bd00ff]/10 border border-[#bd00ff]/20 text-[#e879f9] text-xs font-semibold mb-3">
            <BookOpen className="w-4 h-4 text-[#00f0ff]" />
            ACADEMY CURRICULUM
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] via-slate-100 to-[#bd00ff]">
            実戦テクニカル＆板読みアカデミー
          </h1>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            デイトレードやスキャルピングで勝率を高めるための分析技術を、インタラクティブな解説とシミュレータに沿って体系的に学習します。
          </p>
        </div>

        {/* 章リスト */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learnSteps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStepIdx(idx)}
              className="flex flex-col text-left p-5 bg-[#0b0716] hover:bg-[#120824] border border-[#2d1b4e] hover:border-[#00f0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] rounded-xl transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#bd00ff]/5 rounded-bl-full pointer-events-none" />
              <div className="flex justify-between items-center w-full mb-2">
                <span className="text-[10px] font-black text-slate-500 font-mono tracking-widest uppercase">
                  CHAPTER.{idx + 1}
                </span>
                <span className="text-[9px] text-[#bd00ff] bg-[#bd00ff]/10 px-2 py-0.5 rounded border border-[#bd00ff]/20 font-mono font-bold">
                  {s.highlightElement.toUpperCase()}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white group-hover:text-[#00f0ff] transition-colors mb-2 font-sans flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#bd00ff] rounded-full group-hover:bg-[#00f0ff] transition-colors"></span>
                {s.stepTitle}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {s.summary}
              </p>
            </button>
          ))}
        </div>

        {/* 画面最下部の終了ボタン */}
        <div className="flex flex-col items-center gap-3 mt-6 border-t border-[#2d1b4e]/40 pt-6">
          <button
            onClick={onBackToHome}
            className="w-full max-w-sm flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#bd00ff]/30 to-rose-600/30 hover:from-[#bd00ff] hover:to-rose-600 text-slate-200 hover:text-black font-extrabold rounded-xl text-sm transition-all duration-300 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-rose-500/30 hover:border-rose-400 cursor-pointer active:scale-98"
          >
            <Home className="w-4 h-4" />
            <span>アカデミーを終了してホームに戻る</span>
          </button>
          <span className="text-[10px] text-slate-600 font-mono tracking-widest">TICKTRAINER SYSTEMS v1.0</span>
        </div>
      </div>
    );
  }

  // ==================== 2. 各章の個別学習画面の表示 ====================
  if (!step || !quiz) return null;

  // 現在表示すべきストリームデータ
  const currentSnapshot = quiz.tick_stream_data[currentSec] || {
    timestamp: currentSec,
    current_price: quiz.initial_chart_data[quiz.initial_chart_data.length - 1]?.close || 0,
    bids: [],
    asks: [],
    executions: [],
  };

  // 0秒から現在秒までの歩み値を結合して表示
  const accumulatedExecutions: any[] = [];
  for (let i = 0; i <= currentSec; i++) {
    const s = quiz.tick_stream_data[i];
    if (s && s.executions) {
      accumulatedExecutions.push(...s.executions);
    }
  }

  return (
    <div className="flex flex-col gap-4 py-2 animate-fade-in text-white w-full max-w-5xl mx-auto">
      {/* 上部ヘッダー */}
      <div className="flex justify-between items-center bg-[#0b0716] border border-[#2d1b4e] rounded-xl px-4 py-3 shadow-[0_0_15px_rgba(189,0,255,0.1)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentStepIdx(null)}
            className="p-1.5 bg-[#120824] hover:bg-[#1a0f30] border border-[#bd00ff]/30 text-slate-400 hover:text-[#00f0ff] rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
            title="目次に戻る"
          >
            <List className="w-3.5 h-3.5" />
            <span>目次</span>
          </button>
          
          <div className="h-6 w-[1px] bg-[#2d1b4e]" />

          <div>
            <span className="text-xs font-black tracking-widest text-[#e879f9] font-sans">
              {step.chapterTitle} ({currentStepIdx + 1} / {learnSteps.length})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#05020c] px-3 py-1.5 rounded-lg border border-[#bd00ff]/20 font-mono text-[10px] text-slate-400">
          <span>CHAPTER ACTIVE</span>
        </div>
      </div>

      {/* メインレイアウト: 解説スライドと連動シミュレータ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* 左側: 解説スライドカード */}
        <div className="lg:col-span-5 bg-[#0b0716] border border-[#2d1b4e] rounded-2xl p-5 flex flex-col justify-between min-h-[480px] shadow-[0_0_20px_rgba(189,0,255,0.08)] relative overflow-hidden">
          {/* 装飾用の光 */}
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-[#bd00ff]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex-1 flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 tracking-widest font-mono">STEP.{currentStepIdx + 1}</span>
            <h2 className="text-base font-black tracking-wider text-white border-b border-[#2d1b4e]/60 pb-2 mb-4 font-sans">
              {step.stepTitle}
            </h2>
            
            {/* スライド説明テキスト */}
            <div className="space-y-1 overflow-y-auto max-h-[340px] pr-1">
              {renderConcept(step.concept)}
            </div>
          </div>

          {/* ナビゲーションフッター */}
          <div className="border-t border-[#2d1b4e]/60 pt-4 mt-6 flex justify-between items-center gap-4">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIdx === 0}
              className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                currentStepIdx === 0
                  ? 'bg-slate-900 text-slate-600 border border-slate-950 cursor-not-allowed opacity-50'
                  : 'bg-[#1a0f30] hover:bg-[#2d1553] text-[#e879f9] border border-[#bd00ff]/40 hover:border-[#bd00ff] cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>PREV</span>
            </button>

            <span className="text-[10px] text-slate-500 font-mono">
              STEP {currentStepIdx + 1} of {learnSteps.length}
            </span>

            {currentStepIdx === learnSteps.length - 1 ? (
              <button
                onClick={() => setCurrentStepIdx(null)}
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#bd00ff] to-[#00f0ff] hover:from-[#d946ef] hover:to-[#38bdf8] text-black font-extrabold rounded-lg text-xs transition-all hover:shadow-[0_0_12px_rgba(0,240,255,0.4)] cursor-pointer"
              >
                <span>FINISH</span>
                <List className="w-3.5 h-3.5 stroke-[2.5px]" />
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#bd00ff] to-[#00f0ff] hover:from-[#d946ef] hover:to-[#38bdf8] text-black font-extrabold rounded-lg text-xs transition-all hover:shadow-[0_0_12px_rgba(0,240,255,0.4)] cursor-pointer"
              >
                <span>NEXT</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5px]" />
              </button>
            )}
          </div>
        </div>

        {/* 右側: 連動する実戦ボード */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* チャート */}
            <div className={`md:col-span-7 flex flex-col gap-4 ${getHighlightClass('chart')}`}>
              <TechnicalChart initialData={quiz.initial_chart_data} showResult={false} />
              
              {/* 歩み値ログ */}
              <div className={`bg-[#0b0716] border border-[#1f1235] rounded-xl p-3 flex flex-col h-44 shadow-[0_0_10px_rgba(0,240,255,0.02)] ${getHighlightClass('executions')}`}>
                <span className="text-xs font-bold text-slate-400 mb-2 font-mono">EXECUTION HISTORY</span>
                <div ref={logContainerRef} className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1 font-mono text-[11px]">
                  {accumulatedExecutions.length === 0 ? (
                    <div className="text-slate-700 text-center py-6">約定待ち...</div>
                  ) : (
                    accumulatedExecutions.map((exec, idx) => (
                      <div key={idx} className="grid grid-cols-3 py-0.5 border-b border-slate-900/40 hover:bg-[#120824]/40 px-1 rounded transition-colors">
                        <span className="text-slate-500">{exec.time}</span>
                        <span className={exec.type === 'BUY' ? 'text-[#f43f5e] font-semibold' : exec.type === 'SELL' ? 'text-[#10b981] font-semibold' : 'text-slate-300'}>
                          {exec.price.toLocaleString()}
                        </span>
                        <span className={`text-right ${exec.volume >= 5000 ? 'text-yellow-500 font-bold' : 'text-slate-400'}`}>
                          {exec.volume.toLocaleString()}
                          {exec.volume >= 5000 && ' 💥'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 板情報 */}
            <div className={`md:col-span-5 ${getHighlightClass('board')}`}>
              <Board
                currentPrice={currentSnapshot.current_price}
                bids={currentSnapshot.bids}
                asks={currentSnapshot.asks}
              />
            </div>
          </div>

          {/* ストリームシミュレータバー */}
          <div className="bg-[#0b0716] border border-[#2d1b4e] rounded-xl p-3 flex flex-col gap-2 shadow-[0_0_15px_rgba(189,0,255,0.05)]">
            <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#00f0ff]" />
                DEMO FEED PLAYER (リピート中)
              </span>
              <span className="text-[#00f0ff] font-semibold">{currentSec}s / {maxSec}s</span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 再生/一時停止 */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 bg-[#bd00ff] hover:bg-[#d946ef] text-white rounded transition-all flex items-center justify-center cursor-pointer shadow-[0_0_8px_rgba(189,0,255,0.3)]"
                title={isPlaying ? "一時停止" : "再生"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>

              {/* 最初から再生 */}
              <button
                onClick={() => {
                  setCurrentSec(0);
                  setIsPlaying(true);
                }}
                className="p-1.5 bg-[#1f1235] hover:bg-[#2d1b4e] border border-[#bd00ff]/30 text-slate-300 rounded transition-all flex items-center justify-center cursor-pointer"
                title="最初から再生"
              >
                <RotateCcw className="w-3.5 h-3.5" />
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
                className="flex-1 h-1 bg-[#05020c] rounded-lg appearance-none cursor-pointer accent-[#bd00ff]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 画面の最下部（全幅）に設置したアカデミーコントロール・終了ボタンエリア */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 border-t border-[#2d1b4e]/40 pt-6">
        <button
          onClick={() => setCurrentStepIdx(null)}
          className="w-full sm:w-64 py-3 bg-[#16102a] hover:bg-[#20163c] border border-[#bd00ff]/40 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <List className="w-4 h-4 text-[#00f0ff]" />
          <span>カリキュラム（目次）に戻る</span>
        </button>

        <button
          onClick={onBackToHome}
          className="w-full sm:w-64 py-3 bg-gradient-to-r from-[#bd00ff] to-rose-600 hover:from-[#d946ef] hover:to-rose-500 text-white font-extrabold rounded-xl text-xs transition-all duration-300 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-rose-500/50 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4 stroke-[2.5px]" />
          <span>アカデミーを終了してホームに戻る</span>
        </button>
      </div>
    </div>
  );
};
