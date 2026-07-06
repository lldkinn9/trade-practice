import { ChartDataPoint, Quiz, TickStreamDataPoint, Execution, Quote } from '../types/quiz';
import { calculateMA, calculateRSI } from './technicalIndicators';

// クイズIDから数値のシードを生成するハッシュ関数
function getSeedFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// シード付き疑似乱数生成器 (Mulberry32)
function createRandom(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// チャートの特定パターンが要件を満たしているかを検証するバリデータ
function validateChartPattern(
  chartData: { close: number }[],
  pattern: string
): boolean {
  const ma = calculateMA(chartData);
  const rsi = calculateRSI(chartData);
  
  if (pattern === 'golden_cross') {
    // 表示範囲 (i=60〜89) において MA5 が MA75 を下抜けていた状態から上抜ける瞬間があるか
    let everBelow = false;
    let crossHappened = false;
    
    for (let i = 60; i <= 89; i++) {
      const ma5 = ma.ma5[i];
      const ma75 = ma.ma75[i];
      
      if (ma5 !== null && ma75 !== null) {
        if (ma5 < ma75) {
          everBelow = true;
        } else if (everBelow && ma5 > ma75) {
          crossHappened = true;
          break;
        }
      }
    }
    return crossHappened;
  }
  
  if (pattern === 'dead_cross') {
    // 表示範囲 (i=60〜89) において MA5 が MA75 を上抜けていた状態から下抜ける瞬間があるか
    let everAbove = false;
    let crossHappened = false;
    
    for (let i = 60; i <= 89; i++) {
      const ma5 = ma.ma5[i];
      const ma75 = ma.ma75[i];
      
      if (ma5 !== null && ma75 !== null) {
        if (ma5 > ma75) {
          everAbove = true;
        } else if (everAbove && ma5 < ma75) {
          crossHappened = true;
          break;
        }
      }
    }
    return crossHappened;
  }

  if (pattern === 'divergence_bullish') {
    // 表示範囲において株価の安値が切り下がっている一方、RSIの安値が切り上がっているか
    const closesEarly = chartData.slice(60, 75).map(d => d.close);
    const closesLate = chartData.slice(75, 90).map(d => d.close);
    const rsiEarly = rsi.slice(60, 75).filter((v): v is number => v !== null);
    const rsiLate = rsi.slice(75, 90).filter((v): v is number => v !== null);

    if (rsiEarly.length === 0 || rsiLate.length === 0) return false;

    const priceMinEarly = Math.min(...closesEarly);
    const priceMinLate = Math.min(...closesLate);
    const rsiMinEarly = Math.min(...rsiEarly);
    const rsiMinLate = Math.min(...rsiLate);

    return priceMinLate < priceMinEarly && rsiMinLate > rsiMinEarly;
  }

  if (pattern === 'divergence_bearish') {
    // 表示範囲において株価の高値が切り上がっている一方、RSIの高値が切り下がっているか
    const closesEarly = chartData.slice(60, 75).map(d => d.close);
    const closesLate = chartData.slice(75, 90).map(d => d.close);
    const rsiEarly = rsi.slice(60, 75).filter((v): v is number => v !== null);
    const rsiLate = rsi.slice(75, 90).filter((v): v is number => v !== null);

    if (rsiEarly.length === 0 || rsiLate.length === 0) return false;

    const priceMaxEarly = Math.max(...closesEarly);
    const priceMaxLate = Math.max(...closesLate);
    const rsiMaxEarly = Math.max(...rsiEarly);
    const rsiMaxLate = Math.max(...rsiLate);

    return priceMaxLate > priceMaxEarly && rsiMaxLate < rsiMaxEarly;
  }

  if (pattern === 'breakout') {
    // 表示範囲内において、後半に前半のレジスタンス上限を明確に上抜けているか
    const earlyMax = Math.max(...chartData.slice(60, 84).map(d => d.close));
    const lateMax = Math.max(...chartData.slice(84, 90).map(d => d.close));
    return lateMax > earlyMax;
  }

  if (pattern === 'support_rebound') {
    // 表示範囲の後半で、株価がMA25に1%以内の接近を見せている（タッチしている）か
    let touched = false;
    for (let i = 75; i <= 89; i++) {
      const close = chartData[i].close;
      const ma25Val = ma.ma25[i];
      if (ma25Val !== null) {
        const diff = Math.abs(close - ma25Val) / ma25Val * 100;
        if (diff < 1.0) {
          touched = true;
          break;
        }
      }
    }
    return touched;
  }
  
  return true;
}

// ティックサイズ（呼び値）を決定するヘルパー
function getTickSize(price: number): number {
  if (price < 1000) return 1;
  if (price < 5000) return 5;
  if (price < 30000) return 10;
  return 50;
}

// 1分足データをシミュレート生成する
export function generateChartData(
  startPrice: number,
  length: number,
  pattern: 'up' | 'down' | 'flat' | 'golden_cross' | 'dead_cross' | 'divergence_bullish' | 'divergence_bearish' | 'breakout' | 'support_rebound' | 'selling_climax',
  startTime: Date = new Date(2026, 6, 3, 9, 0, 0),
  random: () => number = Math.random
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  let currentPrice = startPrice;
  const tickSize = getTickSize(startPrice);

  for (let i = 0; i < length; i++) {
    const time = new Date(startTime.getTime() + i * 60 * 1000);
    const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

    // インデックスに応じたトレンドの適用
    let trendFactor = 0;
    let volBase = 10000;
    let volNoise = 15000;

    if (pattern === 'up') {
      trendFactor = 0.8; // 常時上昇傾向
    } else if (pattern === 'down') {
      trendFactor = -0.8;
    } else if (pattern === 'flat') {
      trendFactor = 0;
    } else if (pattern === 'golden_cross') {
      // 最初の70本は十分な下降トレンドとし、70本目から反転上昇させて表示範囲内でクロスさせる
      if (i < 70) {
        trendFactor = -0.8;
      } else if (i < 80) {
        trendFactor = 0.9; // 反転上昇開始
      } else {
        trendFactor = 1.6; // クロス付近・直後の急加速
        volBase = 30000;
      }
    } else if (pattern === 'dead_cross') {
      // 最初の70本は十分な上昇トレンドとし、70本目から反転急降下させて表示範囲内でクロスさせる
      if (i < 70) {
        trendFactor = 0.8;
      } else if (i < 80) {
        trendFactor = -0.9; // 反転下落開始
      } else {
        trendFactor = -1.7; // デッドクロスで急落
        volBase = 25000;
      }
    } else if (pattern === 'divergence_bullish') {
      // 価格は徐々に下落しているが、下げ幅が減衰していく（RSIが反発する準備）
      if (i < 60) {
        trendFactor = -0.6;
      } else {
        trendFactor = -0.1; // 価格下落が緩やかになる
        volBase = 8000;
      }
    } else if (pattern === 'divergence_bearish') {
      // 価格は上昇しているが、上げ幅が減衰
      if (i < 60) {
        trendFactor = 0.6;
      } else {
        trendFactor = 0.1;
        volBase = 8000;
      }
    } else if (pattern === 'breakout') {
      // 一定のレンジで推移し、最後の数本で出来高を伴いレジスタンスを上抜ける
      if (i < 75) {
        trendFactor = (i % 10 < 5) ? 0.6 : -0.6; // もみ合い
      } else if (i < 84) {
        trendFactor = 0.2; // レジスタンス上限に張り付く
        volBase = 15000;
      } else {
        trendFactor = 2.2; // 出来高急増とともにブレイクアウト！
        volBase = 35000;
      }
    } else if (pattern === 'support_rebound') {
      // 上昇後、一時的に調整下落し、中期線タッチで下げ止まる
      if (i < 45) {
        trendFactor = 0.8;
      } else if (i < 75) {
        trendFactor = -0.5; // 押し目
      } else {
        trendFactor = 0.1; // サポートライン上で底堅い動き
        volBase = 12000;
      }
    } else if (pattern === 'selling_climax') {
      // 激しい下落、直前で出来高が急激に跳ね上がる
      if (i < 70) {
        trendFactor = -0.5;
      } else {
        trendFactor = -1.8; // パニック売り
        volBase = 40000;
        volNoise = 60000;
      }
    }

    const open = Math.round(currentPrice / tickSize) * tickSize;
    const change = (random() - (0.5 - trendFactor * 0.15)) * tickSize * 8;
    const close = Math.round((currentPrice + change) / tickSize) * tickSize;
    const high = Math.round((Math.max(open, close) + random() * tickSize * 4) / tickSize) * tickSize;
    const low = Math.round((Math.min(open, close) - random() * tickSize * 4) / tickSize) * tickSize;
    const volume = Math.round(volBase + random() * volNoise);

    data.push({
      time: timeStr,
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  return data;
}

// 10秒間の板・歩み値データを生成する
export function generateTickStream(
  lastPrice: number,
  direction: 'UP' | 'DOWN' | 'STAY',
  pattern: string,
  random: () => number = Math.random
): TickStreamDataPoint[] {
  const stream: TickStreamDataPoint[] = [];
  const tickSize = getTickSize(lastPrice);
  let currentPrice = lastPrice;

  // 基本の板枚数の設定
  const baseVolume = 3000;

  for (let sec = 0; sec <= 10; sec++) {
    // 進行に合わせて価格を緩やかに変化させる
    let priceChangeProb = 0.5; // 上昇確率
    if (direction === 'UP') {
      priceChangeProb = 0.65 + (sec / 30); // 後半になるほど上昇圧力高
    } else if (direction === 'DOWN') {
      priceChangeProb = 0.35 - (sec / 30); // 後半になるほど下落圧力高
    } else {
      priceChangeProb = 0.5;
    }

    if (random() < priceChangeProb) {
      currentPrice = Math.round((currentPrice + (random() > 0.3 ? tickSize : 0)) / tickSize) * tickSize;
    } else {
      currentPrice = Math.round((currentPrice - (random() > 0.3 ? tickSize : 0)) / tickSize) * tickSize;
    }

    // 板情報 (Bids/Asks) の生成
    const bids: Quote[] = [];
    const asks: Quote[] = [];

    // 5気配分作成
    for (let i = 1; i <= 5; i++) {
      const bidPrice = currentPrice - i * tickSize;
      const askPrice = currentPrice + (i - 1) * tickSize;

      let bidVol = Math.round((baseVolume + random() * 4000) / 100) * 100;
      let askVol = Math.round((baseVolume + random() * 4000) / 100) * 100;

      // パターンに応じた特殊な板の配置
      if (pattern === 'breakout') {
        // ブレイクアウト対象の売り板を厚くする (例: 3本目のask)
        if (i === 3) {
          askVol = 35000 - sec * 3000; // 時間経過（約定）とともに売り板が削られるシミュレーション
          if (askVol < 0) askVol = 100;
        }
      } else if (pattern === 'support_rebound') {
        // サポートライン付近の買い板を非常に厚くする (例: 2, 3本目のbid)
        if (i === 2 || i === 3) {
          bidVol = 25000 + Math.round(random() * 5000);
        }
      } else if (pattern === 'selling_climax' && sec > 5) {
        // セリングクライマックス後に厚い買い板が出現する
        bidVol = 40000 + Math.round(random() * 10000);
      } else {
        // 通常の上昇・下降トレンド
        if (direction === 'UP') {
          bidVol = Math.round(bidVol * 1.5);
          askVol = Math.round(askVol * 0.8);
        } else if (direction === 'DOWN') {
          bidVol = Math.round(bidVol * 0.7);
          askVol = Math.round(askVol * 1.6);
        }
      }

      bids.push({ price: bidPrice, volume: bidVol });
      asks.push({ price: askPrice, volume: askVol });
    }

    // 歩み値 (Executions) の生成
    const executions: Execution[] = [];
    // 毎秒1〜4つの約定
    const execCount = Math.floor(random() * 3) + 1;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

    for (let j = 0; j < execCount; j++) {
      let type: 'BUY' | 'SELL' = random() > 0.5 ? 'BUY' : 'SELL';
      let vol = Math.round((200 + random() * 1800) / 100) * 100;

      // パターンに応じた約定の偏り
      if (pattern === 'breakout') {
        type = 'BUY'; // 売り板を買い崩すのでBUY（約定赤色）がメイン
        vol = sec >= 7 ? 5000 + Math.round(random() * 8000) : 1000 + Math.round(random() * 3000); // 後半に超大口が出現
      } else if (pattern === 'selling_climax') {
        if (sec <= 5) {
          type = 'SELL'; // 前半は投げ売り連続
          vol = 3000 + Math.round(random() * 5000);
        } else {
          type = 'BUY'; // 後半は買い戻し・買い支えで激しく激突
          vol = 4000 + Math.round(random() * 8000);
        }
      } else {
        if (direction === 'UP') {
          type = random() > 0.25 ? 'BUY' : 'SELL';
          if (type === 'BUY' && random() > 0.7) vol = 3000 + Math.round(random() * 3000); // 時折大口買い
        } else if (direction === 'DOWN') {
          type = random() > 0.75 ? 'BUY' : 'SELL';
          if (type === 'SELL' && random() > 0.7) vol = 3000 + Math.round(random() * 3000); // 時折大口売り
        }
      }

      // 約定価格の決定
      const execPrice = type === 'BUY' ? asks[0].price : bids[0].price;

      executions.push({
        time: timeStr,
        price: execPrice,
        volume: vol,
        type,
      });
    }

    stream.push({
      timestamp: sec,
      current_price: currentPrice,
      bids,
      asks,
      executions,
    });
  }

  return stream;
}

// クイズオブジェクトを組み立てる
export function buildQuiz(
  id: string,
  symbol: string,
  name: string,
  pattern_type: string,
  startPrice: number,
  chartPattern: 'up' | 'down' | 'flat' | 'golden_cross' | 'dead_cross' | 'divergence_bullish' | 'divergence_bearish' | 'breakout' | 'support_rebound' | 'selling_climax',
  direction: 'UP' | 'DOWN' | 'STAY',
  explanation: string
): Quiz {
  const baseSeed = getSeedFromId(id);
  
  let attempt = 0;
  let initialChart: ChartDataPoint[] = [];
  let tickStream: TickStreamDataPoint[] = [];
  let resultChart: ChartDataPoint[] = [];
  let ratio = 0;

  while (attempt < 100) {
    const seed = baseSeed + attempt;
    const random = createRandom(seed);

    // 初期チャートデータとして90本生成（テクニカル指標の計算を安定させるため）
    initialChart = generateChartData(startPrice, 90, chartPattern, new Date(2026, 6, 3, 9, 0, 0), random);
    
    // 生成されたチャートデータが特定パターンの要件を満たしているかチェックする
    if (validateChartPattern(initialChart, chartPattern)) {
      const lastPrice = initialChart[initialChart.length - 1].close;

      // 10秒間の板・歩み値データをシミュレーション生成
      tickStream = generateTickStream(lastPrice, direction, chartPattern, random);
      
      // 最終秒の株価
      const streamEndPrice = tickStream[tickStream.length - 1].current_price;

      // 回答後に開示するその後の1分足チャート（10本分）を生成
      const afterPattern = direction === 'UP' ? 'up' : direction === 'DOWN' ? 'down' : 'flat';
      resultChart = generateChartData(
        streamEndPrice, 
        10, 
        afterPattern, 
        new Date(2026, 6, 3, 9, 90, 0),
        random
      );

      // 変化率の計算
      const startResultPrice = resultChart[0].open;
      const endResultPrice = resultChart[resultChart.length - 1].close;
      ratio = parseFloat(((endResultPrice - startResultPrice) / startResultPrice * 100).toFixed(2));
      break;
    }
    attempt++;
  }

  if (attempt === 100) {
    console.warn(`[quizGenerator] Could not generate strict pattern for ${id} after 100 attempts.`);
  }

  return {
    id,
    symbol,
    name,
    captured_at: new Date().toISOString(),
    pattern_type,
    initial_chart_data: initialChart,
    tick_stream_data: tickStream,
    answer_direction: direction,
    price_change_ratio: ratio,
    result_chart_data: resultChart,
    ai_explanation: explanation,
  };
}
