/**
 * Pinia イベントストア
 * 予定の状態管理と IndexedDB への永続化
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db } from '../db/db';
import type { CalendarEvent, EventFilters } from '../types/event';

export const useEventStore = defineStore('event', () => {
  // 状態
  const events = ref<CalendarEvent[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 計算済みプロパティ
  const eventCount = computed(() => events.value.length);
  const sortedEvents = computed(() => {
    return [...events.value].sort((a, b) => {
      const aDate = new Date(`${a.startDate}T${a.startTime || '00:00'}`);
      const bDate = new Date(`${b.startDate}T${b.startTime || '00:00'}`);
      return aDate.getTime() - bDate.getTime();
    });
  });

  // IndexedDB からのロード
  async function loadEvents() {
    try {
      isLoading.value = true;
      error.value = null;
      const allEvents = await db.events.toArray();
      // 削除済み（deletedAt が null でない）イベントをフィルタリング
      events.value = allEvents.filter(e => !e.deletedAt);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'イベントのロード中にエラーが発生しました';
      console.error('Failed to load events:', err);
    } finally {
      isLoading.value = false;
    }
  }

  // 新規イベント作成
  async function addEvent(eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      isLoading.value = true;
      error.value = null;

      const newEvent: CalendarEvent = {
        ...eventData,
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // IndexedDB に保存
      await db.events.add(newEvent);
      events.value.push(newEvent);

      return newEvent;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'イベント作成中にエラーが発生しました';
      console.error('Failed to add event:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // イベント更新
  async function updateEvent(id: string, updates: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>) {
    try {
      isLoading.value = true;
      error.value = null;

      const event = events.value.find(e => e.id === id);
      if (!event) {
        throw new Error(`イベント ID ${id} が見つかりません`);
      }

      const updatedEvent: CalendarEvent = {
        ...event,
        ...updates,
        id: event.id,
        createdAt: event.createdAt,
        updatedAt: Date.now()
      };

      // IndexedDB に保存
      await db.events.update(id, updatedEvent);

      // メモリ内の状態を更新
      const index = events.value.findIndex(e => e.id === id);
      if (index !== -1) {
        events.value[index] = updatedEvent;
      }

      return updatedEvent;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'イベント更新中にエラーが発生しました';
      console.error('Failed to update event:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // イベント削除（物理削除ではなく、deletedAt を設定してソフトデリート）
  async function deleteEvent(id: string) {
    try {
      isLoading.value = true;
      error.value = null;

      const event = events.value.find(e => e.id === id);
      if (!event) {
        throw new Error(`イベント ID ${id} が見つかりません`);
      }

      // ソフトデリート: deletedAt を現在時刻に設定
      const deletedEvent: CalendarEvent = {
        ...event,
        deletedAt: Date.now(),
        updatedAt: Date.now()
      };

      // IndexedDB に保存
      await db.events.update(id, deletedEvent);

      // メモリ内から削除
      events.value = events.value.filter(e => e.id !== id);

      return deletedEvent;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'イベント削除中にエラーが発生しました';
      console.error('Failed to delete event:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // イベント検索
  function searchEvents(filters: EventFilters): CalendarEvent[] {
    return events.value.filter(event => {
      if (filters.startDate && event.startDate < filters.startDate) return false;
      if (filters.endDate && event.startDate > filters.endDate) return false;
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const titleMatch = event.title.toLowerCase().includes(searchLower);
        const descMatch = event.description?.toLowerCase().includes(searchLower);
        if (!titleMatch && !descMatch) return false;
      }
      return true;
    });
  }

  // 特定の日付のイベントを取得
  function getEventsByDate(date: string): CalendarEvent[] {
    return events.value.filter(event => event.startDate === date);
  }

  return {
    // 状態
    events,
    isLoading,
    error,
    // 計算済みプロパティ
    eventCount,
    sortedEvents,
    // アクション
    loadEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    searchEvents,
    getEventsByDate
  };
});
