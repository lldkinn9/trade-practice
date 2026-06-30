import { Quiz } from '../types/quiz';

// 過去30本分の1分足チャートを生成するヘルパー
const generateInitialChartData = (startPrice: number, trend: 'up' | 'down' | 'flat'): any[] => {
  const data = [];
  let currentPrice = startPrice;
  const now = new Date();
  
  for (let i = 30; i > 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 1000);
    const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    
    const change = (Math.random() - 0.48) * (trend === 'up' ? 30 : trend === 'down' ? -30 : 15);
    const open = Math.round(currentPrice);
    const close = Math.round(currentPrice + change);
    const high = Math.round(Math.max(open, close) + Math.random() * 15);
    const low = Math.round(Math.min(open, close) - Math.random() * 15);
    const volume = Math.round(5000 + Math.random() * 20000);
    
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
};

export const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-laser-tech-001',
    symbol: '6526',
    name: 'レーザーテック',
    captured_at: '2026-06-30T09:15:00Z',
    pattern_type: '急騰',
    initial_chart_data: generateInitialChartData(35200, 'up'),
    tick_stream_data: [
      {
        timestamp: 0,
        current_price: 35400,
        bids: [
          { price: 35390, volume: 1200 },
          { price: 35380, volume: 1500 },
          { price: 35370, volume: 2200 },
          { price: 35360, volume: 3000 },
          { price: 35350, volume: 4500 }
        ],
        asks: [
          { price: 35410, volume: 800 },
          { price: 35420, volume: 1100 },
          { price: 35430, volume: 1600 },
          { price: 35440, volume: 2100 },
          { price: 35450, volume: 3500 }
        ],
        executions: [
          { time: '09:15:00', price: 35400, volume: 300, type: 'BUY' }
        ]
      },
      {
        timestamp: 1,
        current_price: 35400,
        bids: [
          { price: 35390, volume: 1300 },
          { price: 35380, volume: 1800 },
          { price: 35370, volume: 2200 },
          { price: 35360, volume: 3100 },
          { price: 35350, volume: 4500 }
        ],
        asks: [
          { price: 35410, volume: 600 },
          { price: 35420, volume: 1100 },
          { price: 35430, volume: 1600 },
          { price: 35440, volume: 2100 },
          { price: 35450, volume: 3500 }
        ],
        executions: [
          { time: '09:15:01', price: 35400, volume: 100, type: 'BUY' },
          { time: '09:15:01', price: 35410, volume: 200, type: 'BUY' }
        ]
      },
      {
        timestamp: 2,
        current_price: 35410,
        bids: [
          { price: 35400, volume: 1500 },
          { price: 35390, volume: 1500 },
          { price: 35380, volume: 2000 },
          { price: 35370, volume: 2500 },
          { price: 35360, volume: 3100 }
        ],
        asks: [
          { price: 35410, volume: 400 },
          { price: 35420, volume: 1000 },
          { price: 35430, volume: 1500 },
          { price: 35440, volume: 2100 },
          { price: 35450, volume: 3500 }
        ],
        executions: [
          { time: '09:15:02', price: 35410, volume: 200, type: 'BUY' }
        ]
      },
      {
        timestamp: 3,
        current_price: 35410,
        bids: [
          { price: 35400, volume: 1800 },
          { price: 35390, volume: 1600 },
          { price: 35380, volume: 2000 },
          { price: 35370, volume: 2500 },
          { price: 35360, volume: 3100 }
        ],
        asks: [
          { price: 35420, volume: 900 },
          { price: 35430, volume: 1400 },
          { price: 35440, volume: 2100 },
          { price: 35450, volume: 3400 },
          { price: 35460, volume: 1000 }
        ],
        executions: [
          { time: '09:15:03', price: 35410, volume: 400, type: 'BUY' },
          { time: '09:15:03', price: 35420, volume: 100, type: 'BUY' }
        ]
      },
      {
        timestamp: 4,
        current_price: 35420,
        bids: [
          { price: 35410, volume: 2000 },
          { price: 35400, volume: 2200 },
          { price: 35390, volume: 1800 },
          { price: 35380, volume: 2000 },
          { price: 35370, volume: 2500 }
        ],
        asks: [
          { price: 35420, volume: 800 },
          { price: 35430, volume: 1200 },
          { price: 35440, volume: 2000 },
          { price: 35450, volume: 3400 },
          { price: 35460, volume: 1200 }
        ],
        executions: [
          { time: '09:15:04', price: 35420, volume: 100, type: 'SELL' }
        ]
      },
      {
        timestamp: 5,
        current_price: 35420,
        bids: [
          { price: 35410, volume: 2200 },
          { price: 35400, volume: 2500 },
          { price: 35390, volume: 2000 },
          { price: 35380, volume: 2000 },
          { price: 35370, volume: 2500 }
        ],
        asks: [
          { price: 35430, volume: 1000 },
          { price: 35440, volume: 1800 },
          { price: 35450, volume: 3000 },
          { price: 35460, volume: 1500 },
          { price: 35470, volume: 1000 }
        ],
        executions: [
          { time: '09:15:05', price: 35420, volume: 800, type: 'BUY' },
          { time: '09:15:05', price: 35430, volume: 200, type: 'BUY' }
        ]
      },
      {
        timestamp: 6,
        current_price: 35430,
        bids: [
          { price: 35420, volume: 2500 },
          { price: 35410, volume: 2500 },
          { price: 35400, volume: 2800 },
          { price: 35390, volume: 2000 },
          { price: 35380, volume: 2000 }
        ],
        asks: [
          { price: 35430, volume: 800 },
          { price: 35440, volume: 1500 },
          { price: 35450, volume: 2800 },
          { price: 35460, volume: 1500 },
          { price: 35470, volume: 1200 }
        ],
        executions: [
          { time: '09:15:06', price: 35430, volume: 200, type: 'BUY' }
        ]
      },
      {
        timestamp: 7,
        current_price: 35430,
        bids: [
          { price: 35420, volume: 2600 },
          { price: 35410, volume: 2500 },
          { price: 35400, volume: 2800 },
          { price: 35390, volume: 2000 },
          { price: 35380, volume: 2000 }
        ],
        asks: [
          { price: 35440, volume: 1200 },
          { price: 35450, volume: 2500 },
          { price: 35460, volume: 1600 },
          { price: 35470, volume: 1200 },
          { price: 35480, volume: 1500 }
        ],
        executions: [
          { time: '09:15:07', price: 35430, volume: 600, type: 'BUY' },
          { time: '09:15:07', price: 35440, volume: 300, type: 'BUY' }
        ]
      },
      {
        timestamp: 8,
        current_price: 35440,
        bids: [
          { price: 35430, volume: 2800 },
          { price: 35420, volume: 2800 },
          { price: 35410, volume: 2500 },
          { price: 35400, volume: 2800 },
          { price: 35390, volume: 2000 }
        ],
        asks: [
          { price: 35440, volume: 900 },
          { price: 35450, volume: 2100 },
          { price: 35460, volume: 1600 },
          { price: 35470, volume: 1200 },
          { price: 35480, volume: 1500 }
        ],
        executions: [
          { time: '09:15:08', price: 35440, volume: 300, type: 'BUY' }
        ]
      },
      {
        timestamp: 9,
        current_price: 35440,
        bids: [
          { price: 35430, volume: 3000 },
          { price: 35420, volume: 2800 },
          { price: 35410, volume: 2500 },
          { price: 35400, volume: 2800 },
          { price: 35390, volume: 2000 }
        ],
        asks: [
          { price: 35440, volume: 500 },
          { price: 35450, volume: 1800 },
          { price: 35460, volume: 1600 },
          { price: 35470, volume: 1200 },
          { price: 35480, volume: 1500 }
        ],
        executions: [
          { time: '09:15:09', price: 35440, volume: 400, type: 'BUY' }
        ]
      },
      {
        timestamp: 10,
        current_price: 35450,
        bids: [
          { price: 35440, volume: 3500 },
          { price: 35430, volume: 3200 },
          { price: 35420, volume: 2800 },
          { price: 35410, volume: 2500 },
          { price: 35400, volume: 2800 }
        ],
        asks: [
          { price: 35450, volume: 1500 },
          { price: 35460, volume: 1600 },
          { price: 35470, volume: 1200 },
          { price: 35480, volume: 1500 },
          { price: 35490, volume: 2000 }
        ],
        executions: [
          { time: '09:15:10', price: 35440, volume: 500, type: 'BUY' },
          { time: '09:15:10', price: 35450, volume: 300, type: 'BUY' }
        ]
      }
    ],
    answer_direction: 'UP',
    price_change_ratio: 0.35,
    result_chart_data: [
      { time: '09:16', open: 35450, high: 35550, low: 35430, close: 35520, volume: 45000 },
      { time: '09:17', open: 35520, high: 35600, low: 35500, close: 35580, volume: 38000 }
    ],
    ai_explanation: '板情報において、35,400円から35,440円にかけて買い板（Bids）の厚みが徐々に増加し、下値が切り上がる動きが見られました。歩み値では赤色表示（買い約定）が連続し、売り板の35,410円から35,440円までの厚い売り注文が次々と削られていく様子が確認できます。移動平均線も上向きのモメンタムを維持しており、一時的な小幅なもみ合いを経て上昇圧力が勝利しました。スキャルピングにおいては、買い板の厚い補強と歩み値における積極的な買い約定（大口の買い）が上昇を決定づけた要因です。'
  },
  {
    id: 'quiz-advantest-001',
    symbol: '6857',
    name: 'アドバンテスト',
    captured_at: '2026-06-30T10:30:00Z',
    pattern_type: '急落',
    initial_chart_data: generateInitialChartData(6400, 'down'),
    tick_stream_data: [
      {
        timestamp: 0,
        current_price: 6350,
        bids: [
          { price: 6348, volume: 5000 },
          { price: 6346, volume: 6200 },
          { price: 6344, volume: 4500 },
          { price: 6342, volume: 8000 },
          { price: 6340, volume: 12000 }
        ],
        asks: [
          { price: 6352, volume: 8200 },
          { price: 6354, volume: 9000 },
          { price: 6356, volume: 7500 },
          { price: 6358, volume: 11000 },
          { price: 6360, volume: 15000 }
        ],
        executions: [
          { time: '10:30:00', price: 6350, volume: 800, type: 'SELL' }
        ]
      },
      {
        timestamp: 1,
        current_price: 6350,
        bids: [
          { price: 6348, volume: 4500 },
          { price: 6346, volume: 6200 },
          { price: 6344, volume: 4500 },
          { price: 6342, volume: 8000 },
          { price: 6340, volume: 12000 }
        ],
        asks: [
          { price: 6352, volume: 8500 },
          { price: 6354, volume: 9000 },
          { price: 6356, volume: 7500 },
          { price: 6358, volume: 11000 },
          { price: 6360, volume: 15000 }
        ],
        executions: [
          { time: '10:30:01', price: 6350, volume: 300, type: 'SELL' }
        ]
      },
      {
        timestamp: 2,
        current_price: 6348,
        bids: [
          { price: 6346, volume: 5500 },
          { price: 6344, volume: 4500 },
          { price: 6342, volume: 8000 },
          { price: 6340, volume: 12000 },
          { price: 6338, volume: 5000 }
        ],
        asks: [
          { price: 6350, volume: 4000 },
          { price: 6352, volume: 8800 },
          { price: 6354, volume: 9000 },
          { price: 6356, volume: 7500 },
          { price: 6358, volume: 11000 }
        ],
        executions: [
          { time: '10:30:02', price: 6348, volume: 1000, type: 'SELL' }
        ]
      },
      {
        timestamp: 3,
        current_price: 6348,
        bids: [
          { price: 6346, volume: 5000 },
          { price: 6344, volume: 4500 },
          { price: 6342, volume: 8000 },
          { price: 6340, volume: 12000 },
          { price: 6338, volume: 5000 }
        ],
        asks: [
          { price: 6350, volume: 6000 },
          { price: 6352, volume: 9000 },
          { price: 6354, volume: 9000 },
          { price: 6356, volume: 7500 },
          { price: 6358, volume: 11000 }
        ],
        executions: [
          { time: '10:30:03', price: 6348, volume: 200, type: 'SELL' }
        ]
      },
      {
        timestamp: 4,
        current_price: 6346,
        bids: [
          { price: 6344, volume: 4200 },
          { price: 6342, volume: 7800 },
          { price: 6340, volume: 11000 },
          { price: 6338, volume: 5000 },
          { price: 6336, volume: 6000 }
        ],
        asks: [
          { price: 6348, volume: 5000 },
          { price: 6350, volume: 10000 },
          { price: 6352, volume: 9500 },
          { price: 6354, volume: 9000 },
          { price: 6356, volume: 7500 }
        ],
        executions: [
          { time: '10:30:04', price: 6346, volume: 800, type: 'SELL' }
        ]
      },
      {
        timestamp: 5,
        current_price: 6346,
        bids: [
          { price: 6344, volume: 4000 },
          { price: 6342, volume: 7500 },
          { price: 6340, volume: 11000 },
          { price: 6338, volume: 5000 },
          { price: 6336, volume: 6000 }
        ],
        asks: [
          { price: 6348, volume: 9000 },
          { price: 6350, volume: 10500 },
          { price: 6352, volume: 9500 },
          { price: 6354, volume: 9000 },
          { price: 6356, volume: 7500 }
        ],
        executions: [
          { time: '10:30:05', price: 6346, volume: 1500, type: 'SELL' }
        ]
      },
      {
        timestamp: 6,
        current_price: 6344,
        bids: [
          { price: 6342, volume: 6800 },
          { price: 6340, volume: 10500 },
          { price: 6338, volume: 5000 },
          { price: 6336, volume: 6000 },
          { price: 6334, volume: 4000 }
        ],
        asks: [
          { price: 6346, volume: 7500 },
          { price: 6348, volume: 9500 },
          { price: 6350, volume: 12000 },
          { price: 6352, volume: 9000 },
          { price: 6354, volume: 9000 }
        ],
        executions: [
          { time: '10:30:06', price: 6344, volume: 1200, type: 'SELL' }
        ]
      },
      {
        timestamp: 7,
        current_price: 6344,
        bids: [
          { price: 6342, volume: 6500 },
          { price: 6340, volume: 10000 },
          { price: 6338, volume: 5000 },
          { price: 6336, volume: 6000 },
          { price: 6334, volume: 4000 }
        ],
        asks: [
          { price: 6346, volume: 8000 },
          { price: 6348, volume: 9500 },
          { price: 6350, volume: 12000 },
          { price: 6352, volume: 9000 },
          { price: 6354, volume: 9000 }
        ],
        executions: [
          { time: '10:30:07', price: 6344, volume: 400, type: 'SELL' }
        ]
      },
      {
        timestamp: 8,
        current_price: 6342,
        bids: [
          { price: 6340, volume: 9500 },
          { price: 6338, volume: 4800 },
          { price: 6336, volume: 5500 },
          { price: 6334, volume: 4000 },
          { price: 6332, volume: 7000 }
        ],
        asks: [
          { price: 6344, volume: 6000 },
          { price: 6346, volume: 9000 },
          { price: 6348, volume: 9500 },
          { price: 6350, volume: 12000 },
          { price: 6352, volume: 9000 }
        ],
        executions: [
          { time: '10:30:08', price: 6342, volume: 1800, type: 'SELL' }
        ]
      },
      {
        timestamp: 9,
        current_price: 6342,
        bids: [
          { price: 6340, volume: 9000 },
          { price: 6338, volume: 4800 },
          { price: 6336, volume: 5500 },
          { price: 6334, volume: 4000 },
          { price: 6332, volume: 7000 }
        ],
        asks: [
          { price: 6344, volume: 8000 },
          { price: 6346, volume: 10000 },
          { price: 6348, volume: 9500 },
          { price: 6350, volume: 12000 },
          { price: 6352, volume: 9000 }
        ],
        executions: [
          { time: '10:30:09', price: 6342, volume: 500, type: 'SELL' }
        ]
      },
      {
        timestamp: 10,
        current_price: 6342,
        bids: [
          { price: 6340, volume: 8500 },
          { price: 6338, volume: 4800 },
          { price: 6336, volume: 5500 },
          { price: 6334, volume: 4000 },
          { price: 6332, volume: 7000 }
        ],
        asks: [
          { price: 6344, volume: 11000 },
          { price: 6346, volume: 10000 },
          { price: 6348, volume: 9500 },
          { price: 6350, volume: 12000 },
          { price: 6352, volume: 9000 }
        ],
        executions: [
          { time: '10:30:10', price: 6342, volume: 2000, type: 'SELL' }
        ]
      }
    ],
    answer_direction: 'DOWN',
    price_change_ratio: -0.45,
    result_chart_data: [
      { time: '10:31', open: 6342, high: 6345, low: 6310, close: 6320, volume: 65000 },
      { time: '10:32', open: 6320, high: 6330, low: 6300, close: 6305, volume: 54000 }
    ],
    ai_explanation: '売り圧力の強さが明確に現れた局面です。10秒間の板情報の変化において、売り気配（Asks）の数量が買い板を圧倒的に上回る状況が継続し、買い板（Bids）に買い支えが入らないまま価格が切り下がりました。歩み値では大口の売り注文（緑色表示）が連続して発生し、買い気配の注文を瞬時に消化して下落しました。このように板の合計枚数の極端な偏り（オーバー/アンダー比の悪化）があり、かつ歩み値に大口の売りが頻発している場合は、買い向かうのは危険で、下落に追随するのがセオリーです。'
  }
];
