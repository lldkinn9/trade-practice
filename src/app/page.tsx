'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Quiz, UserLog, PatternQuiz } from '../types/quiz';
import { mockQuizzes } from '../lib/mockData';
import { mockPatternQuizzes } from '../lib/patternData';
import { Dashboard } from '../components/Dashboard';
import { PlayScreen } from '../components/PlayScreen';
import { ResultScreen } from '../components/ResultScreen';
import { PatternQuizScreen } from '../components/PatternQuizScreen';
import { Sparkles, Database, Info, X } from 'lucide-react';

export default function Home() {
  const [view, setView] = useState<'dashboard' | 'play' | 'result' | 'pattern_play'>('dashboard');
  const [patternQuizzes, setPatternQuizzes] = useState<PatternQuiz[]>(mockPatternQuizzes);
  const [currentPatternIndex, setCurrentPatternIndex] = useState<number>(0);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'UP' | 'DOWN' | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [showSqlGuide, setShowSqlGuide] = useState<boolean>(false);

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

  // クイズデータのフェッチ
  useEffect(() => {
    async function loadQuizzes() {
      setIsLoading(true);
      try {
        // Supabase接続テスト
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .limit(10);

        if (error || !data || data.length === 0) {
          console.log('Supabase connection failed or quizzes table is empty. Falling back to mock data.');
          setQuizzes(mockQuizzes);
          setIsDemoMode(true);
        } else {
          // 型変換を伴う読み込み
          const typedQuizzes: Quiz[] = data.map((q: any) => ({
            id: q.id,
            symbol: q.symbol,
            name: q.name,
            captured_at: q.captured_at,
            pattern_type: q.pattern_type,
            initial_chart_data: q.initial_chart_data,
            tick_stream_data: q.tick_stream_data,
            answer_direction: q.answer_direction,
            price_change_ratio: Number(q.price_change_ratio),
            result_chart_data: q.result_chart_data,
            ai_explanation: q.ai_explanation,
          }));
          setQuizzes(typedQuizzes);
          setIsDemoMode(false);
        }
      } catch (err) {
        console.error('Unexpected error loading quizzes:', err);
        setQuizzes(mockQuizzes);
        setIsDemoMode(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadQuizzes();
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

  const handleAnswerSubmit = async (answer: 'UP' | 'DOWN') => {
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

    // Supabaseへのログ書き込み
    try {
      if (!isDemoMode) {
        await supabase.from('user_logs').insert([
          {
            quiz_id: quiz.id,
            is_correct: correct,
            selected_answer: answer,
            answered_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to save log to Supabase:', err);
    }

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
    <main className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between p-4 md:p-6 pb-12 transition-all duration-300">
      {/* ナビゲーションバー */}
      <header className="w-full max-w-4xl mx-auto flex justify-between items-center py-4 border-b border-slate-900/60 mb-6">
        <div className="flex items-center gap-2">
          {/* カスタマイズされたSVGロゴ */}
          <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 text-white fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l6-6 4 4 8-8" />
              <polygon points="14 7 17 7 17 10" className="fill-current" />
              <polygon points="9 11 11 11 11 13" className="fill-current" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              TickTrainer
            </span>
            <span className="text-[9px] text-blue-400 block tracking-widest font-semibold uppercase leading-none mt-0.5">
              Scalping Simulator
            </span>
          </div>
        </div>

        {/* 状態インジケータ */}
        <div className="flex items-center gap-2">
          {isDemoMode ? (
            <button
              onClick={() => setShowSqlGuide(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <Database className="w-3 h-3" />
              <span>デモモードで実行中 (詳細)</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
              <Sparkles className="w-3 h-3" />
              <span>Supabase 接続中</span>
            </div>
          )}
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
      <footer className="w-full max-w-4xl mx-auto border-t border-slate-900/60 mt-8 pt-4 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 gap-2">
        <p>© 2026 TickTrainer. All rights reserved.</p>
        <div className="flex gap-4">
          <button 
            onClick={resetProgress}
            className="hover:text-red-400 transition-colors cursor-pointer"
          >
            学習進捗のリセット
          </button>
          <span>•</span>
          <button 
            onClick={() => setShowSqlGuide(true)}
            className="hover:text-emerald-400 transition-colors cursor-pointer"
          >
            データベース構成ガイド
          </button>
        </div>
      </footer>

      {/* Supabase SQL セットアップ ガイド モーダル */}
      {showSqlGuide && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl relative">
            <button
              onClick={() => setShowSqlGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-5 border-b border-[var(--card-border)] flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Supabase セットアップガイド</h3>
            </div>

            <div className="p-5 overflow-y-auto flex-1 text-xs text-slate-300 space-y-4">
              <div className="bg-[var(--background)] p-3 rounded-lg border border-[var(--card-border)] flex gap-2.5 items-start">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  現在、環境変数が未設定か、またはSupabase上にテーブルが構築されていないため、<strong>ローカルの模擬モックデータ</strong>で動作しています。本番運用するには以下の手順が必要です。
                </p>
              </div>

              <h4 className="font-bold text-white text-sm">ステップ 1: Supabaseでテーブルを作成</h4>
              <p className="leading-relaxed">
                Supabaseの「SQL Editor」を開き、プロジェクトフォルダ内にある <code className="text-blue-400">supabase_schema.sql</code> の中身をコピー＆ペーストして実行（Run）してください。これにより必要なテーブルとインデックスが自動作成されます。
              </p>

              <h4 className="font-bold text-white text-sm">ステップ 2: 環境変数の設定</h4>
              <p className="leading-relaxed">
                プロジェクトルートにある <code className="text-blue-400">.env.local</code> を開き、Supabaseの管理画面から取得したURLおよびAnon Keyを記述してください。
              </p>
              <pre className="bg-[var(--background)] p-2.5 rounded border border-[var(--card-border)] font-mono text-[10px] overflow-x-auto text-slate-400">
                {`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...`}
              </pre>

              <h4 className="font-bold text-white text-sm">ステップ 3: データ収集スクリプトの実行</h4>
              <p className="leading-relaxed">
                ローカル環境のPythonスクリプトからAPI経由でデータを収集・蓄積することで、リアルなクイズ問題がSupabaseへ蓄積され、Webアプリ側でそれらを自動的に出題できるようになります。
              </p>
            </div>

            <div className="p-4 border-t border-[var(--card-border)] text-right bg-[var(--background)] rounded-b-2xl">
              <button
                onClick={() => setShowSqlGuide(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                了解しました
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
