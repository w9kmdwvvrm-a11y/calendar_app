# カレンダーWebアプリ - 開発設計書

## 1. 要件の理解

### 最重要要件
- **ユーザーが登録した予定が、ユーザーの明示的な削除操作なしに消えないこと**

### 機能要件
- スマートフォンのブラウザで利用可能なカレンダーWebアプリ
- 予定の登録・表示・編集・削除機能
- 月単位でのカレンダー表示
- 予定のローカル保存

## 2. システム構成（Ver.1）

### 技術スタック
```
Frontend:
  ├── Vue 3（UI フレームワーク）
  ├── TypeScript（言語）
  ├── Vite（ビルドツール）
  └── Pinia（状態管理）

Storage:
  ├── Dexie.js（IndexedDB ラッパー）
  └── IndexedDB（ローカルデータベース）

Hosting:
  ├── GitHub Pages（本番環境）
  └── GitHub Actions（CI/CD）
```

### 使用しないもの（Ver.1）
- バックエンドサーバー
- API サーバー
- クラウドDB
- 有料サービス

### 運用コスト
- **月額 0 円**

## 3. 画面構成

### 3.1 カレンダービュー（メイン画面）
- **ヘッダー**: 月年表示、前後の月ボタン
- **カレンダーグリッド**:
  - 日付グリッド（7列 × 6行）
  - 曜日ヘッダー（日〜土）
  - 本日を強調表示
  - 選択日付をハイライト
  - 予定数表示
- **予定リスト**: 選択日付の予定一覧
  - 予定追加ボタン
  - 予定をクリックで編集

### 3.2 イベント追加/編集モーダル
**入力項目**:
- タイトル（必須）
- 説明（任意）
- 開始日（必須）
- 開始時刻（任意、終日チェックボックスで制御）
- 終了日（任意）
- 終了時刻（任意）
- 色選択

**操作**:
- 追加／更新ボタン
- 編集時のみ削除ボタン
- キャンセルボタン

## 4. データ構造

### 4.1 CalendarEvent インターフェース
```typescript
interface CalendarEvent {
  id: string;                    // ユニークID（タイムスタンプ + ランダム）
  title: string;                 // 予定タイトル
  description?: string;          // 詳細説明
  startDate: string;             // ISO 8601 形式 (YYYY-MM-DD)
  startTime?: string;            // HH:mm 形式
  endDate?: string;              // ISO 8601 形式
  endTime?: string;              // HH:mm 形式
  allDay: boolean;               // 終日イベント フラグ
  color?: string;                // 色コード
  createdAt: number;             // 作成タイムスタンプ
  updatedAt: number;             // 更新タイムスタンプ
  deletedAt?: number;            // ソフトデリート用（null = 有効）
}
```

### 4.2 IndexedDB スキーマ
```
Database: CalendarAppDB
Version: 1

Store: events
  - keyPath: id
  - indexes:
    - startDate
    - createdAt
    - updatedAt
```

## 5. 開発ルール

1. **既存の設計を確認してから実装する**
   - Excel 資料の設計に基づいて実装

2. **設計にない機能を勝手に追加しない**
   - 仕様変更が必要な場合は事前に相談

3. **要件と実装が矛盾しないようにする**
   - 常に最重要要件を意識

4. **IndexedDB への保存を確実に行う**
   - 追加・更新・削除時の保存を必須

5. **データ消失につながる処理を勝手に追加しない**
   - 物理削除ではなくソフトデリート

6. **スマートフォンでの操作性を優先する**
   - モバイルファースト設計

7. **TypeScript の型を適切に定義する**
   - any 型の使用を最小限に

8. **Git で管理しやすい単位で実装する**
   - 機能ごと、コンポーネントごとにコミット

## 6. 実装状況

### ✅ 完了項目
- [x] プロジェクト初期化（Vite + Vue 3 + TypeScript）
- [x] Pinia ストア構築
- [x] Dexie.js IndexedDB 初期化
- [x] イベント型定義
- [x] イベントストア実装（CRUD 操作）
- [x] カレンダービュー実装
- [x] イベント追加/編集モーダル実装
- [x] GitHub Actions ワークフロー設定
- [x] GitHub Pages デプロイ設定

### ⏳ 今後の拡張予定
- [ ] イベント検索機能（詳細）
- [ ] カレンダーの複数ビュー（週、日）
- [ ] リマインダー機能
- [ ] イベントカテゴリ分類
- [ ] エクスポート/インポート機能
- [ ] バックアップ機能

## 7. 設計上の注意点

### 7.1 ソフトデリート戦略
- 削除時に `deletedAt` フィールドをタイムスタンプで更新
- 必要に応じてデータ復旧が可能
- ビューでは `deletedAt` が null でないイベントをフィルター

### 7.2 ID 生成戦略
- `event_${Date.now()}_${Math.random()}`
- タイムスタンプ + ランダム文字列でユニーク性を保証

### 7.3 タイムゾーン
- 日付: ISO 8601 形式（YYYY-MM-DD）でローカル日付を使用
- タイムスタンプ: JavaScript ミリ秒（UTC）

## 8. 開発環境構築手順

### インストール
```bash
npm install
```

### 開発サーバー起動
```bash
npm run dev
```

### ビルド
```bash
npm run build
```

### デプロイ
- main ブランチへプッシュすると GitHub Actions により自動デプロイ

## 9. トラブルシューティング

### IndexedDB が初期化されない
1. ブラウザの IndexedDB が有効か確認
2. ブラウザのコンソールでエラーを確認
3. ローカルストレージをクリアして再読み込み

### 予定が保存されない
1. ネットワーク確認（必要に応じて）
2. ブラウザのコンソールでエラー確認
3. IndexedDB の容量確認

## 10. 参考資料

- [Vue 3 公式ドキュメント](https://vuejs.org/)
- [Pinia ドキュメント](https://pinia.vuejs.org/)
- [Dexie.js ドキュメント](https://dexie.org/)
- [IndexedDB API](https://developer.mozilla.org/ja/docs/Web/API/IndexedDB_API)
