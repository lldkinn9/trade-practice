import { PatternQuiz } from '../types/quiz';

export const mockPatternQuizzes: PatternQuiz[] = [
  // --- 既存の8問 ---
  {
    id: 'pat-red-three-soldiers',
    name: '赤三兵',
    englishName: 'Three White Soldiers',
    expected_direction: 'UP',
    signal_type: '強気（買い）',
    origin: '酒田五法',
    candles: [
      { type: 'up', open: 20, close: 40, high: 45, low: 15 },
      { type: 'up', open: 30, close: 60, high: 65, low: 28 },
      { type: 'up', open: 50, close: 80, high: 85, low: 48 }
    ],
    description: '上昇トレンドの初期または安値圏で、大陽線が3本連続で安値を切り上げて出現するパターンです。売り方の買い戻しと新規の買いが殺到していることを示し、非常に強力な上昇継続または上昇反転のシグナル（買いシグナル）とされています。特にヒゲが短いものが信頼度が高いとされます。'
  },
  {
    id: 'pat-piercing-line',
    name: '切り込み線',
    englishName: 'Piercing Line',
    expected_direction: 'UP',
    signal_type: '強気（買い）',
    origin: 'ローソク足の組み合わせ',
    candles: [
      { type: 'down', open: 80, close: 30, high: 85, low: 25 },
      { type: 'up', open: 15, close: 60, high: 65, low: 10 }
    ],
    description: '下落トレンドの途中で、大陰線が出た翌日に前日終値よりも大きく窓を開けて安く寄り付いたものの、そこから猛烈に買い戻され、前日の大陰線の実体の「中心（50%）」を超える位置で引けた陽線のペアです。売りの勢いが限界に達し、買い方が主導権を握り返したことを示す上昇反転の買いシグナルです。'
  },
  {
    id: 'pat-three-black-crows',
    name: '三手烏',
    englishName: 'Three Black Crows',
    expected_direction: 'DOWN',
    signal_type: '弱気（売り）',
    origin: '酒田五法',
    candles: [
      { type: 'down', open: 80, close: 60, high: 82, low: 58 },
      { type: 'down', open: 65, close: 40, high: 67, low: 38 },
      { type: 'down', open: 45, close: 20, high: 47, low: 15 }
    ],
    description: '高値圏で大陰線が3本連続して安値を切り下げる形で出現するパターンです。「黒三兵」とも呼ばれます。高値での利食い売りや大口の処分売りが持続的に出ていることを示し、上昇トレンドが完全に終了して本格的な下降トレンドへ転換する非常に強い売りシグナルとされています。'
  },
  {
    id: 'pat-tweezer-top',
    name: '毛抜き天井',
    englishName: 'Tweezer Top',
    expected_direction: 'DOWN',
    signal_type: '弱気（売り）',
    origin: 'ローソク足の組み合わせ',
    candles: [
      { type: 'up', open: 30, close: 70, high: 80, low: 25 },
      { type: 'down', open: 70, close: 40, high: 80, low: 35 }
    ],
    description: '上昇局面において、隣り合う2本のローソク足の高値（ヒゲの先端）が「同じ価格」で並んで止まった形です。これは上値抵抗線（レジスタンス）が非常に強固であることを意味し、これ以上の株価上昇を阻まれた売り手側の勝利を示します。そのため、高値圏での急落を示唆する売りシグナルとなります。'
  },
  {
    id: 'pat-tweezer-bottom',
    name: '毛抜き底',
    englishName: 'Tweezer Bottom',
    expected_direction: 'UP',
    signal_type: '強気（買い）',
    origin: 'ローソク足の組み合わせ',
    candles: [
      { type: 'down', open: 70, close: 30, high: 75, low: 20 },
      { type: 'up', open: 30, close: 60, high: 65, low: 20 }
    ],
    description: '下降局面において、隣り合う2本のローソク足の安値（ヒゲの最下部）がぴったり「同じ価格」でサポートされて止まった形です。これ以上下げるのを強力に防ぐ下値支持線（サポート）が機能したことを示し、売りの勢いが尽きて買い方に有利なトレンド転換（上昇反転）が起きる買いシグナルとなります。'
  },
  {
    id: 'pat-dark-cloud-cover',
    name: '被せ線',
    englishName: 'Dark Cloud Cover',
    expected_direction: 'DOWN',
    signal_type: '弱気（売り）',
    origin: 'ローソク足の組み合わせ',
    candles: [
      { type: 'up', open: 20, close: 70, high: 75, low: 15 },
      { type: 'down', open: 85, close: 40, high: 90, low: 35 }
    ],
    description: '高値圏で大陽線が出た翌日、前日終値より窓を開けて高く寄り付いた（＝好材料が出たなど）ものの、そこから利益確定売りや新規空売りが優勢になり、前日の大陽線の実体の中心（50%）を割り込んで引けた陰線のペアです。上値の重さと売り圧力の急増を示し、下落転換のシグナルとなります。'
  },
  {
    id: 'pat-harami-bullish',
    name: '陽のはらみ線',
    englishName: 'Bullish Harami',
    expected_direction: 'UP',
    signal_type: '強気（買い）',
    origin: 'ローソク足の組み合わせ',
    candles: [
      { type: 'down', open: 80, close: 20, high: 85, low: 15 },
      { type: 'up', open: 35, close: 60, high: 65, low: 30 }
    ],
    description: '下落局面において出現する、大陰線（1日目）の実体の範囲内に、翌日の小さな陽線（2日目）の実体がすっぽりと包み込まれるように（妊婦のお腹のように）はらまれた形です。これまでの激しい下落の勢いが急ブレーキをかけ、もみ合いから上昇へと反転する前兆を示す買いシグナルです。'
  },
  {
    id: 'pat-harami-bearish',
    name: '陰のはらみ線',
    englishName: 'Bearish Harami',
    expected_direction: 'DOWN',
    signal_type: '弱気（売り）',
    origin: 'ローソク足の組み合わせ',
    candles: [
      { type: 'up', open: 20, close: 80, high: 85, low: 15 },
      { type: 'down', open: 65, close: 40, high: 70, low: 35 }
    ],
    description: '上昇局面において出現する、大陽線（1日目）の実体の範囲内に、翌日の小さな陰線（2日目）の実体がすっぽりと包み込まれる形で現れるパターンです。強い上昇の勢いが売り方の買い向かいによって抑えられ、今後のモメンタム失速と天井打ち・下落トレンドへの転換を示す売りシグナルとなります。'
  },

  // --- 追加された12問 (合計20問) ---
  {
    id: 'pat-two-stars-rise',
    name: '上げの二ツ星',
    englishName: 'Two Stars in the Rise',
    expected_direction: 'UP',
    signal_type: '強気（買い）',
    origin: '酒田五法',
    candles: [
      { type: 'up', open: 20, close: 60, high: 65, low: 15 },
      { type: 'up', open: 75, close: 82, high: 87, low: 70 },
      { type: 'up', open: 78, close: 85, high: 90, low: 73 }
    ],
    description: '大陽線が出現した翌日に、窓を開けて上昇し、実体の小さな陽線（星）が2本並んで出現する形です。上昇の勢いが極めて強く、売り注文を完全に消化しながら保ち合っている状態を指します。この二ツ星が現れた後は、さらに上放れて力強く急騰する傾向があり、典型的な買いの継続シグナルです。'
  },
  {
    id: 'pat-two-stars-fall',
    name: '下げの二ツ星',
    englishName: 'Two Stars in the Fall',
    expected_direction: 'DOWN',
    signal_type: '弱気（売り）',
    origin: '酒田五法',
    candles: [
      { type: 'down', open: 80, close: 40, high: 85, low: 35 },
      { type: 'down', open: 25, close: 18, high: 30, low: 10 },
      { type: 'down', open: 22, close: 15, high: 27, low: 8 }
    ],
    description: '大陰線が出現した翌日に、窓を開けて下落し、実体の小さな陰線（星）が2本並ぶパターンです。強い下落モメンタムの途中で買いが入らず、売り圧力が非常に支配的であることを示します。この保ち合いの後、さらに下放れて急落する傾向が強く、強い売りの継続シグナルとなります。'
  },
  {
    id: 'pat-side-by-side-white',
    name: '並び赤',
    englishName: 'Side-by-Side White Lines',
    expected_direction: 'UP',
    signal_type: '強気（買い）',
    origin: '酒田五法',
    candles: [
      { type: 'up', open: 20, close: 45, high: 50, low: 15 },
      { type: 'up', open: 65, close: 80, high: 85, low: 60 },
      { type: 'up', open: 65, close: 80, high: 85, low: 60 }
    ],
    description: '上昇トレンドの途中で、前日のローソク足から上に窓を開けて寄り付き、ほぼ同じ始値・終値を持つ2つの陽線が横並びで出現するパターンです。強い買い圧力が持続しており、押し目を作らせない強気市場を意味します。この出現後は上昇勢いがさらに加速する買いシグナルとなります。'
  },
  {
    id: 'pat-tasuki-gap-up',
    name: '上放れタスキ',
    englishName: 'Upside Gap Tasuki',
    expected_direction: 'UP',
    signal_type: '強気（買い）',
    origin: '酒田五法',
    candles: [
      { type: 'up', open: 20, close: 45, high: 50, low: 15 },
      { type: 'up', open: 65, close: 85, high: 90, low: 60 },
      { type: 'down', open: 75, close: 55, high: 80, low: 50 }
    ],
    description: '上昇トレンドで窓を開けて陽線が出た翌日、陰線が出現して前日の窓を埋めるように下落するものの、窓の下限（1日目の高値）まで届かずに踏みとどまるパターンです。一時的な利益確定売り（押し目）が入っただけであり、買いの足腰が強いことを意味します。さらなる上昇継続を示唆する買いシグナルです。'
  },
  {
    id: 'pat-tasuki-gap-down',
    name: '下放れタスキ',
    englishName: 'Downside Gap Tasuki',
    expected_direction: 'DOWN',
    signal_type: '弱気（売り）',
    origin: '酒田五法',
    candles: [
      { type: 'down', open: 80, close: 55, high: 85, low: 50 },
      { type: 'down', open: 35, close: 15, high: 40, low: 10 },
      { type: 'up', open: 25, close: 45, high: 50, low: 20 }
    ],
    description: '下降トレンドで窓を開けて陰線が出た翌日、陽線が出現して上昇するものの、前日の窓の上限（1日目の安値）を埋め戻せずに失速するパターンです。一時的な反発買いが入ったものの、買い圧力が非常に弱く戻り売りに押されていることを示します。さらなる下落継続を示す売りシグナルです。'
  },
  {
    id: 'pat-three-gaps-up',
    name: '三空踏み上げ',
    englishName: 'Three Gaps Up',
    expected_direction: 'DOWN',
    signal_type: '弱気（売り）',
    origin: '酒田五法',
    candles: [
      { type: 'up', open: 10, close: 25, high: 30, low: 5 },
      { type: 'up', open: 35, close: 50, high: 55, low: 30 },
      { type: 'up', open: 60, close: 75, high: 80, low: 55 },
      { type: 'up', open: 85, close: 95, high: 100, low: 80 }
    ],
    description: '上昇局面において、窓（空）を3回連続で開けながら、陽線が急角度で出現する非常に珍しい極端な上昇パターンです。買いの興奮がピークに達しており、相場がバブル（過熱状態）であることを示します。「三空踏み上げには売り向かえ」という相場格言の通り、天井打ち急落が近い事を示唆する逆張りの売りシグナルです。'
  },
  {
    id: 'pat-three-gaps-down',
    name: '三空叩き込み',
    englishName: 'Three Gaps Down',
    expected_direction: 'UP',
    signal_type: '強気（買い）',
    origin: '酒田五法',
    candles: [
      { type: 'down', open: 100, close: 85, high: 105, low: 80 },
      { type: 'down', open: 75, close: 60, high: 80, low: 55 },
      { type: 'down', open: 50, close: 35, high: 55, low: 30 },
      { type: 'down', open: 25, close: 15, high: 30, low: 10 }
    ],
    description: '下落局面において、窓（空）を3回連続で大きく開けながら、陰線が垂直に下落していくパターンです。パニック売り（投げ売り）が極限に達し、市場の恐怖が最大になっている状態を示します。「三空叩き込みには買い向かえ」とされ、売りのエネルギーが枯渇して底打ち・急反発する直前を示す強力な買いシグナルです。'
  },
  {
    id: 'pat-hammer',
    name: 'ハンマー（カラカサ）',
    englishName: 'Hammer',
    expected_direction: 'UP',
    signal_type: '強気（買い）',
    origin: 'ローソク足の組み合わせ',
    candles: [
      { type: 'down', open: 80, close: 50, high: 85, low: 45 },
      { type: 'down', open: 45, close: 25, high: 50, low: 20 },
      { type: 'up', open: 18, close: 22, high: 23, low: 2 }
    ],
    description: '下落トレンドの安値圏で出現する、実体が極めて小さく、かつ実体の2倍〜3倍以上の「非常に長い下ヒゲ」を持つローソク足です。日中に大きな売り圧力に押されたものの、取引終了にかけて買い手が猛烈に押し戻した（下値支持力の強さ）ことを証明しています。大底を示す非常に重要な買い反転シグナルです。'
  },
  {
    id: 'pat-hanging-man',
    name: '首吊り線',
    englishName: 'Hanging Man',
    expected_direction: 'DOWN',
    signal_type: '弱気（売り）',
    origin: 'ローソク足の組み合わせ',
    candles: [
      { type: 'up', open: 20, close: 50, high: 55, low: 15 },
      { type: 'up', open: 55, close: 80, high: 85, low: 50 },
      { type: 'down', open: 80, close: 76, high: 81, low: 50 }
    ],
    description: '高値圏（上昇トレンドの頂点付近）で出現する、実体が小さく「非常に長い下ヒゲ」を持つローソク足です。一見、安値から買い戻された強気な足に見えますが、高値圏での一時的な急落が発生した（＝買いが途切れた形跡）ことを意味し、買い手が限界に達し相場が天井を打って下落へ転じる強い売りシグナルとなります。'
  },
  {
    id: 'pat-gravestone',
    name: '墓石（塔婆）',
    englishName: 'Gravestone Doji',
    expected_direction: 'DOWN',
    signal_type: '弱気（売り）',
    origin: 'ローソク足の組み合わせ',
    candles: [
      { type: 'up', open: 20, close: 50, high: 55, low: 15 },
      { type: 'up', open: 50, close: 75, high: 80, low: 45 },
      { type: 'down', open: 70, close: 70, high: 100, low: 70 }
    ],
    description: '高値圏で出現する、始値と終値が「その日の安値」とほぼ一致し、「非常に長い上ヒゲ」だけが伸びたローソク足です。日中に強い買いが入って急騰したものの、大口の利益確定売りや空売りに叩き潰されて全戻しした状態を指します。買いの勢いが完全に消失したことを示す、典型的な天井打ちの売りシグナルです。'
  },
  {
    id: 'pat-dragonfly',
    name: 'トンボ',
    englishName: 'Dragonfly Doji',
    expected_direction: 'UP',
    signal_type: '強気（買い）',
    origin: 'ローソク足の組み合わせ',
    candles: [
      { type: 'down', open: 80, close: 50, high: 85, low: 45 },
      { type: 'down', open: 45, close: 20, high: 50, low: 15 },
      { type: 'up', open: 20, close: 20, high: 20, low: 2 }
    ],
    description: '安値圏で出現する、始値と終値が「その日の高値」とほぼ一致し、「非常に長い下ヒゲ」だけが垂れ下がったローソク足です。売り圧力が一度マーケットを叩き落としたものの、取引終盤にそのすべての売りを買い手が吸収して完全に巻き戻した強さを示します。底打ちから急反発する強力な買いシグナルです。'
  },
  {
    id: 'pat-three-stars-south',
    name: '下げの三ツ星',
    englishName: 'Three Stars in the South',
    expected_direction: 'UP',
    signal_type: '強気（買い）',
    origin: '酒田五法',
    candles: [
      { type: 'down', open: 80, close: 50, high: 85, low: 35 },
      { type: 'down', open: 48, close: 32, high: 50, low: 25 },
      { type: 'down', open: 30, close: 22, high: 31, low: 20 }
    ],
    description: '下落局面において、陰線が3本連続で現れるものの、日を追うごとに実体が縮小し、かつ下ヒゲも短くなる（または出なくなる）パターンです。これは売り手の売却エネルギーが日増しに枯渇し、下落のモメンタムが完全に減速したことを示しています。底打ちから上昇反転することを示唆する買いシグナルです。'
  }
];
