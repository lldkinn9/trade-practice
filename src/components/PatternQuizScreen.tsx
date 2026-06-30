import React, { useState } from 'react';
import { PatternQuiz } from '../types/quiz';
import { PatternChart } from './PatternChart';
import { CheckCircle2, XCircle, ArrowRight, RefreshCw, Eye, EyeOff, BookOpen, AlertCircle } from 'lucide-react';

interface PatternQuizScreenProps {
  quiz: PatternQuiz;
  onAnswer: (isCorrect: boolean, answer: 'UP' | 'DOWN') => void;
  onNext: () => void;
  onBack: () => void;
}

export const PatternQuizScreen: React.FC<PatternQuizScreenProps> = ({
  quiz,
  onAnswer,
  onNext,
  onBack,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<'UP' | 'DOWN' | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const handleAnswerSubmit = (answer: 'UP' | 'DOWN') => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    const correct = quiz.expected_direction === answer;
    onAnswer(correct, answer);
  };

  const handleNextQuiz = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowHint(false);
    onNext();
  };

  const isCorrect = selectedAnswer === quiz.expected_direction;

  return (
    <div className="flex flex-col gap-5 py-2 animate-fade-in text-white max-w-lg mx-auto">
      
      {/* 共通ヘッダー */}
      <div className="flex justify-between items-center bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-400">
            ローソク足パターンクイズ
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          {quiz.origin}
        </span>
      </div>

      {/* 解答前の問題指示 */}
      {!isAnswered ? (
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-slate-200">問題</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              下のローソク足の組み合わせ（形）が出現した際、一般的にその後、株価はどちらに動く（シグナル）とされていますか？
            </p>
          </div>
        </div>
      ) : (
        /* 正誤判定ヘッダー */
        <div className={`rounded-xl border p-4 flex items-center gap-4 transition-all duration-300 ${
          isCorrect 
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-950/30 border-red-500/30 text-red-400'
        }`}>
          {isCorrect ? (
            <CheckCircle2 className="w-10 h-10 stroke-[2px] animate-bounce shrink-0" />
          ) : (
            <XCircle className="w-10 h-10 stroke-[2px] animate-pulse shrink-0" />
          )}
          <div>
            <h2 className="text-lg font-bold tracking-wider">
              {isCorrect ? '正解！' : '不正解...'}
            </h2>
            <p className="text-xs opacity-80 mt-0.5">
              あなたの回答: {selectedAnswer === 'UP' ? '上昇する (BUY)' : '下降する (SELL)'}
              {' / '}
              正解: {quiz.expected_direction === 'UP' ? '上昇する (BUY)' : '下降する (SELL)'}
            </p>
          </div>
        </div>
      )}

      {/* チャート描画 */}
      <div className="flex flex-col gap-2">
        <PatternChart candles={quiz.candles} />
        
        {/* ヒントボタン (回答前のみ) */}
        {!isAnswered && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-slate-400 hover:text-slate-200 transition-colors border border-[var(--card-border)] rounded-full hover:bg-[var(--card-bg)] cursor-pointer"
            >
              {showHint ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showHint ? 'パターン名を隠す' : 'パターン名を表示 (ヒント)'}</span>
            </button>
          </div>
        )}

        {/* ヒント開示 (回答前、または回答後は自動開示) */}
        {(showHint || isAnswered) && (
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-3 text-center animate-fade-in">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">パターン名</span>
            <span className="text-base font-bold text-white tracking-wider block mt-0.5">
              {quiz.name}
            </span>
            <span className="text-xs text-slate-400 font-mono italic block">
              {quiz.englishName}
            </span>
            {isAnswered && (
              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded border mt-2 ${
                quiz.expected_direction === 'UP' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                シグナル: {quiz.signal_type}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 解答・結果セクション */}
      {!isAnswered ? (
        <div className="grid grid-cols-2 gap-4 mt-2">
          <button
            onClick={() => handleAnswerSubmit('UP')}
            className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-[#ef4444] hover:bg-[#ff5555] active:scale-95 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/35 cursor-pointer"
          >
            <span className="text-sm tracking-wider">上昇する (BUY)</span>
            <span className="text-[9px] opacity-75 font-normal">強気反転 / 上昇シグナル</span>
          </button>

          <button
            onClick={() => handleAnswerSubmit('DOWN')}
            className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-[#10b981] hover:bg-[#05d993] active:scale-95 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 cursor-pointer"
          >
            <span className="text-sm tracking-wider">下降する (SELL)</span>
            <span className="text-[9px] opacity-75 font-normal">弱気反転 / 下落シグナル</span>
          </button>
        </div>
      ) : (
        /* 要因解説カード */
        <div className="bg-gradient-to-b from-[var(--card-bg)] to-[var(--background)] border border-[var(--card-border)] rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2.5">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200">パターンの解説</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-[var(--background)]/40 p-3 rounded-lg border border-[var(--card-border)]/50 font-sans">
            {quiz.description}
          </p>

          <div className="grid grid-cols-1 gap-2.5 mt-4">
            <button
              onClick={handleNextQuiz}
              className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-95 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 cursor-pointer text-xs"
            >
              <span>次のパターンを解く</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onBack}
              className="text-center text-xs text-slate-500 hover:text-slate-300 transition-colors mt-2 underline"
            >
              トレーニングメニューに戻る
            </button>
          </div>
        </div>
      )}

      {/* 戻るリンク (未回答時のみ一番下に配置) */}
      {!isAnswered && (
        <button 
          onClick={onBack}
          className="text-center text-xs text-slate-500 hover:text-slate-300 transition-colors mt-2 underline"
        >
          トレーニングメニューに戻る
        </button>
      )}
    </div>
  );
};
