# カレンダーWebアプリ

スマートフォンのブラウザで利用できるカレンダーWebアプリケーション。Vue 3 + TypeScript + Vite で構築されており、IndexedDB を使用してオフラインで予定を保存します。

## 主な機能

- 📅 カレンダー表示（月単位）
- ✏️ 予定の追加・編集・削除
- 🔍 予定の検索
- 💾 IndexedDB を使用したローカルストレージ
- 📱 スマートフォン対応
- 🚀 GitHub Pages でのホスティング

## 技術スタック

- **フロントエンド**: Vue 3
- **言語**: TypeScript
- **ビルドツール**: Vite
- **状態管理**: Pinia
- **データベース**: Dexie.js (IndexedDB)
- **ホスティング**: GitHub Pages
- **CI/CD**: GitHub Actions

## セットアップ

### インストール

```bash
npm install
```

### 開発サーバーを起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

### ビルド

```bash
npm run build
```

`dist` フォルダに本番用ファイルが生成されます。

### プレビュー

```bash
npm run preview
```

ビルド後の出力をプレビューします。

## プロジェクト構造

```
src/
├── components/        # Vue コンポーネント
│   └── EventModal.vue
├── db/               # Dexie.js 設定
│   └── db.ts
├── stores/           # Pinia ストア
│   └── eventStore.ts
├── types/            # TypeScript 型定義
│   └── event.ts
├── views/            # ビューコンポーネント
│   └── CalendarView.vue
├── utils/            # ユーティリティ関数
├── assets/           # 静的アセット
├── App.vue           # メインコンポーネント
├── main.ts           # エントリポイント
└── style.css         # グローバルスタイル
```

## データ永続化

予定は IndexedDB に保存されます。ユーザーが削除操作を行わない限り、データは保持されます。

### Soft Delete（ソフトデリート）

予定の削除は物理削除ではなく、`deletedAt` フィールドを設定して論理削除を行うため、必要に応じてデータ復旧が可能です。

## ブラウザ対応

- Chrome（デスクトップ・モバイル）
- Firefox
- Safari（iOS を含む）
- Edge

IndexedDB に対応するブラウザが必要です。

## GitHub Pages へのデプロイ

このプロジェクトは GitHub Actions により自動的に main ブランチへのプッシュ時に GitHub Pages にデプロイされます。

詳細は `.github/workflows/deploy.yml` を参照してください。

## ライセンス

MIT License

## 開発ルール

1. 既存の設計を確認してから実装する
2. 設計にない機能を勝手に追加しない
3. 要件と実装が矛盾しないようにする
4. IndexedDB への保存を確実に行う
5. データ消失につながる処理を勝手に追加しない
6. スマートフォンでの操作性を優先する
7. TypeScript の型を適切に定義する
8. Git で管理しやすい単位で実装する

