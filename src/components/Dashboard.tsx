import React from 'react';
import { Play, Award, CheckCircle, BarChart2, BookOpen } from 'lucide-react';

interface DashboardProps {
  onStartTraining: () => void;
  onStartPatternQuiz: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onStartTraining, 
  onStartPatternQuiz,
}) => {

  return (
    <div className="flex flex-col gap-6 py-4 animate-fade-in">
      {/* ヒーローセクション */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0a2311]/50 via-slate-900/40 to-[#041208]/20 border border-[var(--card-border)] p-6 overflow-hidden">
        {/* 背景の光沢効果 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl -z-10" />

        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4 border border-emerald-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            株式技術トレーニングプログラム
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2 font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
            次の値動きを予測する実践スキルを磨く。
          </h1>
          <p className="text-slate-400 text-xs mb-6 leading-relaxed">
            実際の場中データを基にした1秒刻みの板読みと、酒田五法をはじめとする有名なローソク足パターンから取引能力を高めます。
          </p>
          
          {/* モード選択グリッド */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {/* モード 1: スキャルピング */}
            <button
              onClick={onStartTraining}
              className="flex flex-col items-start text-left p-4 bg-[var(--card-bg)] hover:bg-[var(--card-border)]/50 border border-[var(--card-border)] rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-md cursor-pointer group"
            >
              <div className="w-8 h-8 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <BarChart2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block">① 板読みスキャ練習</span>
              <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed">
                10秒間の板ストリーム・歩み値の推移から1分後の値動きを予測。
              </span>
            </button>

            {/* モード 2: パターンクイズ */}
            <button
              onClick={onStartPatternQuiz}
              className="flex flex-col items-start text-left p-4 bg-[var(--card-bg)] hover:bg-[var(--card-border)]/50 border border-[var(--card-border)] rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-md cursor-pointer group"
            >
              <div className="w-8 h-8 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block">② ローソク足パターン</span>
              <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed">
                有名なローソク足の組み合わせ（酒田五法など）からシグナルを学習。
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* クイックガイド */}
      <div className="bg-[var(--card-bg)]/60 border border-[var(--card-border)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-200">トレーニングの流れ</h2>
        </div>
        <ol className="text-xs text-slate-400 space-y-3 list-decimal list-inside pl-1 leading-relaxed">
          <li>
            <strong className="text-slate-300">チャート確認:</strong> 出題前の過去30本の1分足チャートから、直近のトレンドやサポート・レジスタンスラインを把握します。
          </li>
          <li>
            <strong className="text-slate-300">板ストリームの再生:</strong> クイズ画面に遷移すると、10秒間の板情報・歩み値の動きがリアルタイムに再生されます。買い板・売り板の厚みの変化、約定スピードを読み取ってください。
          </li>
          <li>
            <strong className="text-slate-300">予測と回答:</strong> 1分後の株価が「上昇（UP）」するか「下落（DOWN）」するかを選択します。
          </li>
          <li>
            <strong className="text-slate-300">解説と復習:</strong> 回答後、実際の値動きとGemini APIがテクニカル要因を分析した自動解説で、自分の仮説を検証します。
          </li>
        </ol>
      </div>
    </div>
  );
};
