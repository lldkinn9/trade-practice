export interface ChartDataPoint {
  time: string; // "HH:MM"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Execution {
  time: string; // "HH:MM:SS"
  price: number;
  volume: number;
  type: 'BUY' | 'SELL' | 'UNKNOWN';
}

export interface Quote {
  price: number;
  volume: number;
}

export interface TickStreamDataPoint {
  timestamp: number; // 0 to 10 seconds
  current_price: number;
  bids: Quote[]; // 買い気配、価格の高い順 (例: 5~10気配)
  asks: Quote[]; // 売り気配、価格の低い順
  executions: Execution[]; // この1秒間に発生した約定（歩み値）
}

export interface Quiz {
  id: string;
  symbol: string;
  name: string;
  captured_at: string;
  pattern_type: '急騰' | '急落' | '微増' | '微減' | 'レンジ' | string;
  initial_chart_data: ChartDataPoint[]; // 開始前の過去30本分の1分足
  tick_stream_data: TickStreamDataPoint[]; // 10秒間の1秒刻みデータ
  answer_direction: 'UP' | 'DOWN' | 'STAY';
  price_change_ratio: number;
  result_chart_data: ChartDataPoint[]; // 回答後に開示するその後の1分足チャート
  ai_explanation: string;
}

export interface UserLog {
  id: string;
  quiz_id: string;
  is_correct: boolean;
  selected_answer: 'UP' | 'DOWN' | 'STAY';
  answered_at: string;
}

export interface CandlePattern {
  type: 'up' | 'down'; // up=陽線(赤), down=陰線(緑)
  open: number;
  close: number;
  high: number;
  low: number;
}

export interface PatternQuiz {
  id: string;
  name: string; // "赤三兵" など
  englishName: string;
  expected_direction: 'UP' | 'DOWN';
  signal_type: '強気（買い）' | '弱気（売り）';
  candles: CandlePattern[];
  description: string; // なぜそう動くかの解説
  origin: string; // 「酒田五法」「ローソク足の組み合わせ」など
}

