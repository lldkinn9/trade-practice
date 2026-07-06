import { ChartDataPoint } from '../types/quiz';

export interface MACalculation {
  ma5: (number | null)[];
  ma25: (number | null)[];
  ma75: (number | null)[];
}

export function calculateMA(data: { close: number }[]): MACalculation {
  const ma5: (number | null)[] = [];
  const ma25: (number | null)[] = [];
  const ma75: (number | null)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    ma5.push(calculateSingleMA(data, i, 5));
    ma25.push(calculateSingleMA(data, i, 25));
    ma75.push(calculateSingleMA(data, i, 75));
  }
  return { ma5, ma25, ma75 };
}

function calculateSingleMA(data: { close: number }[], index: number, period: number): number | null {
  if (index < period - 1) return null;
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[index - i].close;
  }
  return sum / period;
}

export function calculateRSI(data: { close: number }[], period: number = 14): (number | null)[] {
  const rsi: (number | null)[] = [];
  if (data.length < period) {
    return data.map(() => null);
  }

  let gains = 0;
  let losses = 0;

  // 最初の期間の変化を計算
  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff > 0) {
      gains += diff;
    } else {
      losses -= diff;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsi.push(null);
      continue;
    }

    if (i > period) {
      const diff = data[i].close - data[i - 1].close;
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;
      // ワイルダーの平滑化
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
  }

  return rsi;
}

export interface MACDResult {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
}

export function calculateMACD(data: { close: number }[]): MACDResult {
  const macd: (number | null)[] = [];
  const signal: (number | null)[] = [];
  const histogram: (number | null)[] = [];

  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);

  const rawMACD: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const val12 = ema12[i];
    const val26 = ema26[i];
    if (val12 !== null && val26 !== null) {
      const diff = val12 - val26;
      macd.push(diff);
      rawMACD.push(diff);
    } else {
      macd.push(null);
    }
  }

  // シグナル線 (MACDの9期間EMA)
  const signalEMA = calculateEMAFromSeries(rawMACD, 9);
  let sigIdx = 0;

  for (let i = 0; i < data.length; i++) {
    if (macd[i] === null) {
      signal.push(null);
      histogram.push(null);
    } else {
      const sigVal = signalEMA[sigIdx++];
      signal.push(sigVal);
      if (sigVal !== null) {
        histogram.push(macd[i]! - sigVal);
      } else {
        histogram.push(null);
      }
    }
  }

  return { macd, signal, histogram };
}

function calculateEMA(data: { close: number }[], period: number): (number | null)[] {
  const ema: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prevEma = 0;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push(null);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      prevEma = sum / period;
      ema.push(prevEma);
    } else {
      prevEma = data[i].close * k + prevEma * (1 - k);
      ema.push(prevEma);
    }
  }
  return ema;
}

function calculateEMAFromSeries(data: number[], period: number): (number | null)[] {
  const ema: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prevEma = 0;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push(null);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      prevEma = sum / period;
      ema.push(prevEma);
    } else {
      prevEma = data[i] * k + prevEma * (1 - k);
      ema.push(prevEma);
    }
  }
  return ema;
}

export function convertTo5Min(oneMinData: ChartDataPoint[]): ChartDataPoint[] {
  const fiveMinData: ChartDataPoint[] = [];

  // インデックス0から5本ずつをマージ
  for (let i = 0; i < oneMinData.length; i += 5) {
    const chunk = oneMinData.slice(i, i + 5);
    if (chunk.length === 0) break;

    const open = chunk[0].open;
    const close = chunk[chunk.length - 1].close;
    const high = Math.max(...chunk.map((c) => c.high));
    const low = Math.min(...chunk.map((c) => c.low));
    const volume = chunk.reduce((sum, c) => sum + c.volume, 0);
    const time = chunk[chunk.length - 1].time;

    fiveMinData.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return fiveMinData;
}
