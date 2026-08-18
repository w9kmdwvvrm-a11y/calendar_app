/**
 * Dexie.js データベース設定
 * IndexedDB を使用してオフラインで予定を保存
 */
import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { CalendarEvent } from '../types/event';

export class CalendarDB extends Dexie {
  events!: Table<CalendarEvent>;

  constructor() {
    super('CalendarAppDB');
    this.version(1).stores({
      events: '++id, startDate, createdAt, updatedAt'
    });
  }
}

export const db = new CalendarDB();
