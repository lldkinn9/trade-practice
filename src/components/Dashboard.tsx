import React from 'react';
import { Play, Award, CheckCircle, BarChart2, BookOpen } from 'lucide-react';

interface DashboardProps {
  onStartTraining: () => void;
  onStartPatternQuiz: () => void;
  onStartLearnMode: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onStartTraining, 
  onStartPatternQuiz,
  onStartLearnMode,
}) => {

  return (
    <div className="flex flex-col gap-6 py-4 animate-fade-in">
      {/* ヒーローセクション */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#1b083a]/40 via-slate-950/70 to-[#080315]/40 border border-[#2d1b4e] p-6 overflow-hidden shadow-[0_0_25px_rgba(189,0,255,0.1)]">
        {/* 背景の光沢効果 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f0ff]/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-[#bd00ff]/5 rounded-full blur-2xl -z-10" />

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#bd00ff]/10 text-[#e879f9] text-xs font-semibold mb-4 border border-[#bd00ff]/20">
            <BookOpen className="w-3.5 h-3.5 text-[#00f0ff]" />
            株式技術トレーニングプログラム
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-2 font-sans bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] via-slate-100 to-[#bd00ff]">
            次の値動きを予測する実践スキルを磨く。
          </h1>
          <p className="text-slate-400 text-xs mb-6 leading-relaxed">
            本物のテクニカル分析力を養うために体系的に構築されたサンプルデータと、1秒刻みの板読み・歩み値の推移から取引能力を高めます。
          </p>
          
          {/* モード選択グリッド */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            {/* モード 1: スキャルピング */}
            <button
              onClick={onStartTraining}
              className="flex flex-col items-start text-left p-4 bg-[#0d091a] hover:bg-[#120824] border border-[#2d1b4e] hover:border-[#00f0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.25)] rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-md cursor-pointer group"
            >
              <div className="w-8 h-8 bg-[#00f0ff]/10 text-[#00f0ff] rounded-lg flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-[0_0_8px_rgba(0,240,255,0.2)]">
                <BarChart2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block font-sans">① 板読みスキャ練習</span>
              <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed font-sans">
                10秒間の板・歩み値と各種指標から1分後の値動きを予測（全45問）。
              </span>
            </button>

            {/* モード 2: パターンクイズ */}
            <button
              onClick={onStartPatternQuiz}
              className="flex flex-col items-start text-left p-4 bg-[#0d091a] hover:bg-[#120824] border border-[#2d1b4e] hover:border-[#bd00ff] hover:shadow-[0_0_15px_rgba(189,0,255,0.25)] rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-md cursor-pointer group"
            >
              <div className="w-8 h-8 bg-[#bd00ff]/10 text-[#e879f9] rounded-lg flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-[0_0_8px_rgba(189,0,255,0.2)]">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block font-sans">② ローソク足パターン</span>
              <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed font-sans">
                有名なローソク足の組み合わせ（酒田五法など）からシグナルを学習。
              </span>
            </button>

            {/* モード 3: アカデミー学習モード */}
            <button
              onClick={onStartLearnMode}
              className="flex flex-col items-start text-left p-4 bg-[#0d091a] hover:bg-[#120824] border border-[#2d1b4e] hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.25)] rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-md cursor-pointer group"
            >
              <div className="w-8 h-8 bg-yellow-400/10 text-yellow-400 rounded-lg flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-[0_0_8px_rgba(250,204,21,0.2)]">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block font-sans">③ アカデミー（学習）</span>
              <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed font-sans">
                ローソク足、移動平均線、板、歩み値、RSI等の見方を体系的に学習。
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* クイックガイド */}
      <div className="bg-[#0b0716]/60 border border-[#1f1235] shadow-[0_0_15px_rgba(189,0,255,0.05)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-4 h-4 text-[#00f0ff] neon-text-cyan" />
          <h2 className="text-sm font-semibold text-slate-200">トレーニングの流れ</h2>
        </div>
        <ol className="text-xs text-slate-400 space-y-3 list-decimal list-inside pl-1 leading-relaxed">
          <li>
            <strong className="text-[#00f0ff]">マルチタイムチャート確認:</strong> 出題前のチャート（1分足・5分足切り替え可能）から、移動平均線3本、RSIやMACD等のテクニカル指標の動きを把握します。
          </li>
          <li>
            <strong className="text-[#00f0ff]">板ストリームの再生:</strong> クイズ画面に遷移すると、10秒間の板情報・歩み値の動きがリアルタイムに再生されます。買い板・売り板の厚みの変化、約定スピードを読み取ってください。
          </li>
          <li>
            <strong className="text-[#00f0ff]">予測と回答:</strong> その後の株価が「上昇（UP）」するか「下落（DOWN）」するか、あるいは「横ばい（STAY）」を選択します。
          </li>
          <li>
            <strong className="text-[#00f0ff]">解説と復習:</strong> 回答後、実際の値動きと詳細なテクニカル要因解説から、自分の仮説を検証します。
          </li>
        </ol>
      </div>
    </div>
  );
};
