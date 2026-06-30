import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TickTrainer - デイトレ・スキャル練習用クイズアプリ',
    short_name: 'TickTrainer',
    description: '板ストリームと歩み値から値動きを予測する完全無料のスキャルピング練習ツール',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0F19',
    theme_color: '#0B0F19',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      }
    ],
  };
}
