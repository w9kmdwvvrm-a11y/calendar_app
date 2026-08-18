<template>
  <div class="calendar-container">
    <!-- ヘッダー -->
    <header class="calendar-header">
      <button @click="previousMonth" class="nav-btn">←</button>
      <h2>{{ currentMonthYear }}</h2>
      <button @click="nextMonth" class="nav-btn">→</button>
    </header>

    <!-- イベントモーダル -->
    <EventModal
      :isOpen="isModalOpen"
      :selectedDate="selectedDate || ''"
      :editingEvent="editingEvent"
      @close="closeModal"
      @save="handleEventSaved"
      @delete="handleEventDeleted"
    />

    <!-- カレンダーグリッド -->
    <div class="calendar-grid">
      <!-- 曜日ヘッダー -->
      <div class="weekday-header">
        <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
      </div>

      <!-- カレンダー日付 -->
      <div class="calendar-dates">
        <div
          v-for="date in calendarDates"
          :key="date.dateString"
          @click="selectDate(date.dateString)"
          :class="[
            'calendar-date',
            { 'other-month': !date.currentMonth },
            { 'selected': selectedDate === date.dateString },
            { 'today': date.isToday }
          ]"
        >
          <div class="date-number">{{ date.day }}</div>
          <div class="event-indicator" v-if="getEventsByDate(date.dateString).length > 0">
            {{ getEventsByDate(date.dateString).length }} 件
          </div>
        </div>
      </div>
    </div>

    <!-- 選択日付のイベントリスト -->
    <div class="selected-date-events" v-if="selectedDate">
      <h3>{{ selectedDate }} のイベント</h3>
      <div v-if="selectedDateEvents.length === 0" class="no-events">
        予定がありません
      </div>
      <ul v-else class="event-list">
        <li v-for="event in selectedDateEvents" :key="event.id" class="event-item" @click="editEvent(event)">
          <span class="event-title">{{ event.title }}</span>
          <span v-if="event.startTime" class="event-time">{{ event.startTime }}</span>
        </li>
      </ul>
      <button @click="openAddEventModal" class="add-event-btn">
        予定を追加
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useEventStore } from '../stores/eventStore';
import EventModal from '../components/EventModal.vue';
import type { CalendarEvent } from '../types/event';

const eventStore = useEventStore();
const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
const currentDate = ref(new Date());
const selectedDate = ref<string | null>(null);

// モーダル関連
const isModalOpen = ref(false);
const editingEvent = ref<CalendarEvent | undefined>(undefined);

// 現在の月年表示
const currentMonthYear = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = String(currentDate.value.getMonth() + 1).padStart(2, '0');
  return `${year}年${month}月`;
});

// カレンダー用の日付配列を生成
const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const dateString = date.toISOString().split('T')[0];
    const isToday = date.getTime() === today.getTime();
    const currentMonth = date.getMonth() === month;

    dates.push({
      day: date.getDate(),
      dateString,
      isToday,
      currentMonth
    });
  }

  return dates;
});

// 選択日付のイベント
const selectedDateEvents = computed(() => {
  if (!selectedDate.value) return [];
  return eventStore.getEventsByDate(selectedDate.value);
});

// 月前へ
function previousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1);
}

// 月次へ
function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1);
}

// 日付選択
function selectDate(dateString: string) {
  selectedDate.value = dateString;
}

// 指定日付のイベントを取得
function getEventsByDate(dateString: string) {
  return eventStore.getEventsByDate(dateString);
}

// イベント編集モーダルを開く
function editEvent(event: CalendarEvent) {
  editingEvent.value = event;
  isModalOpen.value = true;
}

// イベント追加モーダルを開く
function openAddEventModal() {
  editingEvent.value = undefined;
  isModalOpen.value = true;
}

// モーダルを閉じる
function closeModal() {
  isModalOpen.value = false;
  editingEvent.value = undefined;
}

// イベント保存後の処理
function handleEventSaved(_event: CalendarEvent) {
  // イベントが保存されたのでモーダルは閉じられる
  closeModal();
}

// イベント削除後の処理
function handleEventDeleted(_id: string) {
  // イベントが削除されたのでモーダルは閉じられる
  closeModal();
}

// マウント時にイベントをロード
onMounted(() => {
  eventStore.loadEvents();
});
</script>

<style scoped>
.calendar-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  font-family: sans-serif;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .calendar-container {
    padding: 0.75rem;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .calendar-container {
    padding: 0.5rem;
  }
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

@media (max-width: 480px) {
  .calendar-header {
    margin-bottom: 1rem;
    padding: 0;
  }
}

.calendar-header h2 {
  font-size: 1.3rem;
  margin: 0;
  min-width: 120px;
  text-align: center;
}

@media (max-width: 480px) {
  .calendar-header h2 {
    font-size: 1.1rem;
    min-width: 100px;
  }
}

.nav-btn {
  background: #007AFF;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

@media (max-width: 480px) {
  .nav-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}

.nav-btn:active {
  background: #0056b3;
}

.calendar-grid {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

@media (max-width: 480px) {
  .calendar-grid {
    margin-bottom: 1rem;
  }
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.weekday {
  padding: 0.5rem;
  text-align: center;
  font-weight: bold;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .weekday {
    padding: 0.4rem 0.2rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .weekday {
    padding: 0.3rem 0.1rem;
    font-size: 0.75rem;
  }
}

.calendar-dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-date {
  aspect-ratio: 1;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  transition: background-color 0.2s;
}

@media (max-width: 768px) {
  .calendar-date {
    min-height: 50px;
    padding: 0.3rem;
  }
}

@media (max-width: 480px) {
  .calendar-date {
    min-height: 40px;
    padding: 0.2rem;
  }
}

.calendar-date:active {
  background-color: #e3f2fd;
}

.calendar-date.other-month {
  background-color: #fafafa;
  color: #999;
}

.calendar-date.selected {
  background-color: #007AFF;
  color: white;
}

.calendar-date.today {
  border: 2px solid #FF3B30;
}

.date-number {
  font-weight: bold;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .date-number {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .date-number {
    font-size: 0.8rem;
  }
}

.event-indicator {
  font-size: 0.7rem;
  color: #666;
  margin-top: 0.2rem;
}

@media (max-width: 480px) {
  .event-indicator {
    font-size: 0.6rem;
    margin-top: 0.1rem;
  }
}

.calendar-date.selected .event-indicator {
  color: white;
}

.selected-date-events {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
}

@media (max-width: 480px) {
  .selected-date-events {
    padding: 0.75rem;
  }
}

.selected-date-events h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

@media (max-width: 480px) {
  .selected-date-events h3 {
    margin-bottom: 0.75rem;
    font-size: 1rem;
  }
}

.no-events {
  text-align: center;
  color: #999;
  padding: 1rem;
}

@media (max-width: 480px) {
  .no-events {
    padding: 0.75rem;
  }
}

.event-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

.event-item {
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 3px solid #007AFF;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (max-width: 480px) {
  .event-item {
    padding: 0.4rem;
    margin-bottom: 0.4rem;
    flex-direction: column;
    align-items: flex-start;
  }
}

.event-item:active {
  background-color: #f0f0f0;
}

.event-title {
  flex: 1;
  font-weight: 500;
}

@media (max-width: 480px) {
  .event-title {
    width: 100%;
    font-size: 0.95rem;
  }
}

.event-time {
  color: #666;
  font-size: 0.9rem;
  margin-left: 0.5rem;
}

@media (max-width: 480px) {
  .event-time {
    margin-left: 0;
    font-size: 0.85rem;
  }
}

.add-event-btn {
  width: 100%;
  padding: 0.75rem;
  background: #34C759;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s;
}

@media (max-width: 480px) {
  .add-event-btn {
    padding: 0.6rem;
    font-size: 0.95rem;
  }
}

.add-event-btn:active {
  background: #30B950;
}
</style>
