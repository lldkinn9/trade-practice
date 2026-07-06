'use client';

import React, { useState, useEffect } from 'react';
import { Quiz, UserLog, PatternQuiz } from '../types/quiz';
import { mockQuizzes } from '../lib/quizData';
import { mockPatternQuizzes } from '../lib/patternData';
import { Dashboard } from '../components/Dashboard';
import { PlayScreen } from '../components/PlayScreen';
import { ResultScreen } from '../components/ResultScreen';
import { PatternQuizScreen } from '../components/PatternQuizScreen';
import { LearnModeScreen } from '../components/LearnModeScreen';
import { Sparkles, BookOpen, Info, X } from 'lucide-react';

export default function Home() {
  const [view, setView] = useState<'dashboard' | 'play' | 'result' | 'pattern_play' | 'learn_mode'>('dashboard');
  const [patternQuizzes, setPatternQuizzes] = useState<PatternQuiz[]>(mockPatternQuizzes);
  const [currentPatternIndex, setCurrentPatternIndex] = useState<number>(0);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'UP' | 'DOWN' | 'STAY' | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // 学習進捗統計
  const [stats, setStats] = useState({
    totalAnswered: 0,
    correctCount: 0,
    todayCount: 0,
    todayGoal: 5,
  });

  // LocalStorageから進捗と統計をロード
  useEffect(() => {
    const savedStats = localStorage.getItem('ticktrainer_stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error('Failed to parse stats from localStorage', e);
      }
    }
  }, []);

  // 統計を保存するヘルパー
  const saveStats = (newStats: typeof stats) => {
    setStats(newStats);
    localStorage.setItem('ticktrainer_stats', JSON.stringify(newStats));
  };

  // クイズデータのフェッチ (ローカルデータから即時ロード)
  useEffect(() => {
    setQuizzes(mockQuizzes);
    setIsLoading(false);
  }, []);

  const handleStartTraining = () => {
    if (quizzes.length === 0) return;
    // シャッフルまたはランダムに開始
    const randomIndex = Math.floor(Math.random() * quizzes.length);
    setCurrentQuizIndex(randomIndex);
    setView('play');
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const handleStartPatternQuiz = () => {
    if (patternQuizzes.length === 0) return;
    const randomIndex = Math.floor(Math.random() * patternQuizzes.length);
    setCurrentPatternIndex(randomIndex);
    setView('pattern_play');
  };

  const handlePatternAnswer = (isCorrectAnswer: boolean, answer: 'UP' | 'DOWN') => {
    // 統計更新 (板読みと共通)
    const newStats = {
      ...stats,
      totalAnswered: stats.totalAnswered + 1,
      correctCount: stats.correctCount + (isCorrectAnswer ? 1 : 0),
      todayCount: stats.todayCount + 1,
    };
    saveStats(newStats);
  };

  const handleNextPatternQuiz = () => {
    if (patternQuizzes.length === 0) return;
    let nextIndex = Math.floor(Math.random() * patternQuizzes.length);
    if (patternQuizzes.length > 1 && nextIndex === currentPatternIndex) {
      nextIndex = (nextIndex + 1) % patternQuizzes.length;
    }
    setCurrentPatternIndex(nextIndex);
  };

  const handleAnswerSubmit = async (answer: 'UP' | 'DOWN' | 'STAY') => {
    const quiz = quizzes[currentQuizIndex];
    if (!quiz) return;

    setSelectedAnswer(answer);
    
    // 正解判定
    // answer_directionが 'UP' で answerが 'UP' なら正解
    // answer_directionが 'DOWN' で answerが 'DOWN' なら正解
    // answer_directionが 'STAY' ならどちらも不正解（スキャの観点）
    const correct = quiz.answer_direction === answer;
    setIsCorrect(correct);

    // 統計更新
    const newStats = {
      ...stats,
      totalAnswered: stats.totalAnswered + 1,
      correctCount: stats.correctCount + (correct ? 1 : 0),
      todayCount: stats.todayCount + 1,
    };
    saveStats(newStats);

    // Supabaseへのログ書き込みはローカル完結のため不要
    setView('result');
  };

  const handleNextQuiz = () => {
    if (quizzes.length === 0) return;
    // 次のランダムなクイズへ
    let nextIndex = Math.floor(Math.random() * quizzes.length);
    // 同じクイズが連続するのを防ぐ (クイズが2つ以上ある場合)
    if (quizzes.length > 1 && nextIndex === currentQuizIndex) {
      nextIndex = (nextIndex + 1) % quizzes.length;
    }
    setCurrentQuizIndex(nextIndex);
    setView('play');
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const handleRetryStream = () => {
    setView('play');
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const resetProgress = () => {
    if (confirm('今日の進捗と過去の正答率データをリセットしますか？')) {
      const reset = {
        totalAnswered: 0,
        correctCount: 0,
        todayCount: 0,
        todayGoal: 5,
      };
      saveStats(reset);
    }
  };

  return (
    <main className="min-h-screen bg-[#05020c]/70 text-slate-100 flex flex-col justify-between p-4 md:p-6 pb-12 transition-all duration-300">
      {/* ナビゲーションバー */}
      <header className="w-full max-w-4xl mx-auto flex justify-between items-center py-4 border-b border-slate-900/60 mb-6">
        <div className="flex items-center gap-2">
          {/* カスタマイズされたSVGロゴ */}
          <div className="w-9 h-9 bg-[#0b0716] rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.4)] border border-[#00f0ff]/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#bd00ff]/20 to-[#00f0ff]/20" />
            <svg viewBox="0 0 100 100" className="w-6 h-6 text-[#00f0ff] relative z-10 fill-none stroke-current" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 75 L45 45 L65 60 L85 25" stroke="url(#logo-neon-grad)" />
              <circle cx="45" cy="45" r="5" fill="#0b0716" stroke="#00f0ff" strokeWidth="4" />
              <circle cx="85" cy="25" r="5" fill="#0b0716" stroke="#bd00ff" strokeWidth="4" />
              <defs>
                <linearGradient id="logo-neon-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#bd00ff" />
                  <stop offset="100%" stopColor="#00f0ff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] to-[#bd00ff] neon-text-cyan">
              TickTrainer Pro
            </span>
            <span className="text-[9px] text-[#bd00ff] block tracking-widest font-bold uppercase leading-none mt-0.5 font-mono">
              Technical & Orderbook Academy
            </span>
          </div>
        </div>

        {/* ガイドボタン */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-bold bg-[#bd00ff]/10 text-[#e879f9] rounded-full border border-[#bd00ff]/30 hover:bg-[#bd00ff]/20 hover:border-[#bd00ff]/60 hover:shadow-[0_0_12px_rgba(189,0,255,0.4)] transition-all duration-300 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>テクニカル分析ガイド</span>
          </button>
        </div>
      </header>

      {/* コンテンツセクション */}
      <section className="flex-1 w-full max-w-4xl mx-auto flex flex-col justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-mono">クイズデータを読み込んでいます...</p>
          </div>
        ) : (
          <>
            {view === 'dashboard' && (
              <Dashboard 
                onStartTraining={handleStartTraining} 
                onStartPatternQuiz={handleStartPatternQuiz}
                onStartLearnMode={() => setView('learn_mode')}
              />
            )}
            
            {view === 'learn_mode' && (
              <LearnModeScreen
                onBackToHome={() => setView('dashboard')}
              />
            )}
            
            {view === 'play' && quizzes.length > 0 && (
              <PlayScreen
                quiz={quizzes[currentQuizIndex]}
                onAnswer={handleAnswerSubmit}
                onBack={() => setView('dashboard')}
              />
            )}

            {view === 'result' && quizzes.length > 0 && (
              <ResultScreen
                quiz={quizzes[currentQuizIndex]}
                selectedAnswer={selectedAnswer!}
                isCorrect={isCorrect!}
                onNext={handleNextQuiz}
                onRetry={handleRetryStream}
                onBackToHome={() => setView('dashboard')}
              />
            )}

            {view === 'pattern_play' && patternQuizzes.length > 0 && (
              <PatternQuizScreen
                quiz={patternQuizzes[currentPatternIndex]}
                onAnswer={handlePatternAnswer}
                onNext={handleNextPatternQuiz}
                onBack={() => setView('dashboard')}
              />
            )}
          </>
        )}
      </section>

      {/* フッター */}
      <footer className="w-full max-w-4xl mx-auto border-t border-slate-900/60 mt-8 pt-4 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 gap-2 font-mono">
        <p>© 2026 <span className="text-[#00f0ff]">TickTrainer Pro</span>. Cyber Technical Academy</p>
        <div className="flex gap-4">
          <button 
            onClick={resetProgress}
            className="hover:text-[#f43f5e] transition-colors cursor-pointer"
          >
            PROGRESS RESET
          </button>
          <span>•</span>
          <button 
            onClick={() => setShowGuide(true)}
            className="hover:text-[#00f0ff] transition-colors cursor-pointer"
          >
            LEARNING GUIDE
          </button>
        </div>
      </footer>

      {/* テクニカル分析＆板読み 学習ガイド モーダル */}
      {showGuide && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0b0716] border border-[#bd00ff]/30 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-[0_0_30px_rgba(189,0,255,0.2)] relative">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#00f0ff] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-5 border-b border-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#00f0ff] neon-text-cyan" />
              <h3 className="font-bold text-white text-base font-sans">実戦テクニカル＆板読み学習ガイド</h3>
            </div>

            <div className="p-5 overflow-y-auto flex-1 text-xs text-slate-300 space-y-4">
              <div className="bg-[#120824] p-3 rounded-lg border border-[#bd00ff]/20 flex gap-2.5 items-start">
                <Info className="w-4 h-4 text-[#00f0ff] shrink-0 mt-0.5" />
                <p className="leading-relaxed font-sans">
                  本アプリは、デイトレードやスキャルピングにおいて必須となる<strong>チャート・板情報・歩み値</strong>の3つの要素を有機的に連動させて次の値動きを予測する技術を養うクイズです。
                </p>
              </div>

              <h4 className="font-bold text-[#e879f9] text-sm font-sans">1. チャートの分析（マルチタイムフレーム・移動平均線）</h4>
              <p className="leading-relaxed font-sans">
                本アプリでは<strong>1分足</strong>と<strong>5分足</strong>をリアルタイムで切り替えて確認できます。
                <br />・<strong>1分足：</strong> 直近の極めて細かい押し目や、ブレイクアウトのトリガーを確認するのに適しています。
                <br />・<strong>5分足：</strong> より大きなトレンドの方向性（環境認識）を確認します。5分足が上向きなら、1分足での一時的な下落は「押し目買い」の好機となります。
                <br />・<strong>移動平均線（3本）：</strong> 短期(5)、中期(25)、長期(75)の並び順（パーフェクトオーダー）や、ゴールデンクロス・デッドクロス、平均線へのタッチ（サポート・レジスタンス）に注目します。
              </p>

              <h4 className="font-bold text-[#e879f9] text-sm font-sans">2. 板読み（Order Book）</h4>
              <p className="leading-relaxed font-sans">
                買い気配（Bids）と売り気配（Asks）の注文の厚みに注目します。
                <br />・特定の価格に非常に大きな注文（売り蓋/買い板）がある場合、そこが抵抗帯または支持帯となります。
                <br />・スキャルピングでは、分厚い売り板が食われ始めた時に一緒に買い（ブレイクアウト）、分厚い買い板が消えたり崩された時に即座に逃げる判断が求められます。
              </p>

              <h4 className="font-bold text-[#e879f9] text-sm font-sans">3. 歩み値（Executions）</h4>
              <p className="leading-relaxed font-sans">
                実際に約定した取引の履歴です。
                <br />・<strong>赤色表示：</strong> 買い手が売り注文を直接叩いた（積極的な買い）。
                <br />・<strong>緑色表示：</strong> 売り手が買い注文を直接叩いた（積極的な売り）。
                <br />・<strong>💥マーク（大口約定）：</strong> 機関投資家や大口投資家が大きなロットで取引した形跡です。大口がどちらに仕掛けているかを見極め、そのトレンドに追随します。
              </p>

              <h4 className="font-bold text-white text-sm">4. RSI & MACD オシレーター指標</h4>
              <p className="leading-relaxed">
                チャートの下に表示されるインジケーターも極めて有用です。
                <br />・<strong>RSI：</strong> 30%以下は売られすぎ（反発の準備）、70%以上は買われすぎ（反落の警戒）。株価が安値を更新しているのにRSIが上がっている「ダイバージェンス（逆行現象）」はトレンド反転の強力な予兆です。
                <br />・<strong>MACD：</strong> MACD線とシグナル線のクロス、ヒストグラムの増減から、トレンドの勢いの変化をいち早く捉えます。
              </p>
            </div>

            <div className="p-4 border-t border-[var(--card-border)] text-right bg-[var(--background)] rounded-b-2xl">
              <button
                onClick={() => setShowGuide(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                ガイドを閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
