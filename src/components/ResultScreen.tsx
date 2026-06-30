import React from 'react';
import { Quiz } from '../types/quiz';
import { MiniChart } from './MiniChart';
import { CheckCircle2, XCircle, ArrowRight, RefreshCw, BarChart } from 'lucide-react';

interface ResultScreenProps {
  quiz: Quiz;
  selectedAnswer: 'UP' | 'DOWN';
  isCorrect: boolean;
  onNext: () => void;
  onRetry: () => void;
  onBackToHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  quiz,
  selectedAnswer,
  isCorrect,
  onNext,
  onRetry,
  onBackToHome,
}) => {
  // 解説テキストからタグを自動抽出するロジック
  const extractTags = (text: string): string[] => {
    const keywords = [
      { name: '板の厚み', matches: ['板', '気配', '買い板', '売り板'] },
      { name: '歩み値', matches: ['歩み値', '約定', '出来高'] },
      { name: '大口取引', matches: ['大口', '機関', 'まとまった注文'] },
      { name: 'モメンタム', matches: ['モメンタム', '勢い', '急騰', '急落'] },
      { name: '移動平均線', matches: ['移動平均線', 'MA', '5本線'] },
      { name: 'スキャルピング', matches: ['スキャルピング', 'スキャ', '数秒', '1分足'] },
    ];
    
    const matched = keywords.filter((k) =>
      k.matches.some((m) => text.toLowerCase().includes(m.toLowerCase()))
    );

    return matched.length > 0 ? matched.map((m) => m.name) : ['テクニカル分析', '板読み'];
  };

  const tags = extractTags(quiz.ai_explanation);

  return (
    <div className="flex flex-col gap-5 py-2 animate-fade-in text-white max-w-4xl mx-auto">
      {/* 正誤判定ヘッダー */}
      <div className={`rounded-xl border p-5 flex items-center justify-between transition-all duration-300 ${
        isCorrect 
          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' 
          : 'bg-red-950/30 border-red-500/30 text-red-400'
      }`}>
        <div className="flex items-center gap-4">
          {isCorrect ? (
            <CheckCircle2 className="w-12 h-12 stroke-[2px] animate-bounce" />
          ) : (
            <XCircle className="w-12 h-12 stroke-[2px] animate-pulse" />
          )}
          <div>
            <h2 className="text-2xl font-bold tracking-wider">
              {isCorrect ? '正解！' : '不正解...'}
            </h2>
            <p className="text-xs opacity-80 mt-1">
              あなたの予測: <strong className="font-bold">{selectedAnswer === 'UP' ? '上昇する (UP)' : '下降する (DOWN)'}</strong>
              {' / '}
              正解: <strong className="font-bold">{quiz.answer_direction === 'UP' ? '上昇する (UP)' : quiz.answer_direction === 'DOWN' ? '下降する (DOWN)' : '横ばい (STAY)'}</strong>
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs opacity-75 font-mono">1分後の値変化率</div>
          <div className={`text-xl font-bold font-mono ${
            quiz.price_change_ratio >= 0 ? 'text-[#ef4444]' : 'text-[#10b981]'
          }`}>
            {quiz.price_change_ratio >= 0 ? `+${quiz.price_change_ratio}` : quiz.price_change_ratio}%
          </div>
        </div>
      </div>

      {/* 銘柄情報の開示 */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 flex justify-between items-center">
        <div>
          <span className="text-xs text-slate-400 block font-medium">出題銘柄</span>
          <span className="text-sm font-bold tracking-wider text-white">
            {quiz.name} ({quiz.symbol})
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">パターンタイプ</span>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            {quiz.pattern_type}
          </span>
        </div>
      </div>

      {/* チャート（結果開示：showResult={true}） */}
      <div className="w-full">
        <MiniChart
          initialData={quiz.initial_chart_data}
          resultData={quiz.result_chart_data}
          showResult={true}
        />
      </div>

      {/* AIの要因解説カード */}
      <div className="bg-gradient-to-b from-[var(--card-bg)] to-[var(--background)] border border-[var(--card-border)] rounded-xl p-5 relative overflow-hidden">
        {/* 背景の淡い輝き */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl -z-10" />

        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
            <BarChart className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">AI テクニカル要因解説</h3>
        </div>

        {/* 解説文 */}
        <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4 whitespace-pre-line bg-[var(--background)]/40 p-3.5 rounded-lg border border-[var(--card-border)]/50">
          {quiz.ai_explanation}
        </p>

        {/* テクニカルタグ */}
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 py-3 bg-[var(--card-bg)] hover:bg-[var(--card-border)] active:scale-95 text-slate-300 hover:text-white border border-[var(--card-border)] font-bold rounded-xl transition-all duration-200 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          もう一度板の動きを見る
        </button>

        <button
          onClick={onNext}
          className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-95 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 cursor-pointer"
        >
          <span>次の問題へ進む</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ホームに戻るボタン（テキストリンク風） */}
      <button 
        onClick={onBackToHome}
        className="text-center text-xs text-slate-500 hover:text-slate-300 transition-colors mt-4 underline block mx-auto cursor-pointer"
      >
        ホームに戻る
      </button>
    </div>
  );
};
