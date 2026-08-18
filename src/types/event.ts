/**
 * 予定（イベント）の型定義
 */
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO 8601 形式: YYYY-MM-DD
  startTime?: string; // HH:mm 形式
  endDate?: string; // ISO 8601 形式: YYYY-MM-DD
  endTime?: string; // HH:mm 形式
  allDay: boolean;
  color?: string; // 色コード
  createdAt: number; // タイムスタンプ
  updatedAt: number; // タイムスタンプ
  deletedAt?: number; // ソフトデリート用（null = 有効）
}

export type EventFilters = {
  startDate?: string;
  endDate?: string;
  searchText?: string;
};
