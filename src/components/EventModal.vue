<template>
  <div v-if="isOpen" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <header class="modal-header">
        <h2>{{ isEditMode ? 'イベントを編集' : '予定を追加' }}</h2>
        <button @click="close" class="close-btn">✕</button>
      </header>

      <form @submit.prevent="handleSubmit" class="event-form">
        <!-- タイトル -->
        <div class="form-group">
          <label for="title">タイトル *</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            required
            placeholder="予定を入力してください"
            class="form-input"
          />
        </div>

        <!-- 説明 -->
        <div class="form-group">
          <label for="description">説明</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="詳細を入力（任意）"
            class="form-textarea"
            rows="3"
          ></textarea>
        </div>

        <!-- 日付 -->
        <div class="form-group">
          <label for="startDate">開始日 *</label>
          <input
            id="startDate"
            v-model="formData.startDate"
            type="date"
            required
            class="form-input"
          />
        </div>

        <!-- 時間 -->
        <div class="form-group">
          <label for="allDay">
            <input
              id="allDay"
              v-model="formData.allDay"
              type="checkbox"
              class="form-checkbox"
            />
            終日
          </label>
        </div>

        <div v-if="!formData.allDay" class="form-group">
          <label for="startTime">開始時刻</label>
          <input
            id="startTime"
            v-model="formData.startTime"
            type="time"
            class="form-input"
          />
        </div>

        <!-- 終了日 -->
        <div class="form-group">
          <label for="endDate">終了日</label>
          <input
            id="endDate"
            v-model="formData.endDate"
            type="date"
            class="form-input"
          />
        </div>

        <div v-if="!formData.allDay && formData.endDate" class="form-group">
          <label for="endTime">終了時刻</label>
          <input
            id="endTime"
            v-model="formData.endTime"
            type="time"
            class="form-input"
          />
        </div>

        <!-- 色 -->
        <div class="form-group">
          <label for="color">色</label>
          <div class="color-selector">
            <div
              v-for="c in colors"
              :key="c"
              @click="formData.color = c"
              :style="{ backgroundColor: c }"
              :class="['color-option', { selected: formData.color === c }]"
            ></div>
          </div>
        </div>

        <!-- エラー表示 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- ボタン -->
        <div class="form-actions">
          <button @click="close" type="button" class="btn btn-secondary">
            キャンセル
          </button>
          <button v-if="isEditMode" @click="handleDelete" type="button" class="btn btn-danger">
            削除
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? '保存中...' : (isEditMode ? '更新' : '追加') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useEventStore } from '../stores/eventStore';
import type { CalendarEvent } from '../types/event';

const eventStore = useEventStore();

// Props
const props = defineProps<{
  isOpen: boolean;
  selectedDate: string;
  editingEvent?: CalendarEvent;
}>();

// Emits
const emit = defineEmits<{
  close: [];
  save: [event: CalendarEvent];
  delete: [id: string];
}>();

// データ
const colors = ['#007AFF', '#FF3B30', '#34C759', '#FF9500', '#5856D6'];
const isSubmitting = ref(false);
const errorMessage = ref('');

// フォーム データ
const formData = ref<Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>({
  title: '',
  description: '',
  startDate: props.selectedDate,
  startTime: '',
  endDate: '',
  endTime: '',
  allDay: true,
  color: '#007AFF'
});

// 編集モード判定
const isEditMode = computed(() => !!props.editingEvent);

// フォーム データの初期化
const initializeForm = () => {
  if (props.editingEvent) {
    formData.value = {
      title: props.editingEvent.title,
      description: props.editingEvent.description || '',
      startDate: props.editingEvent.startDate,
      startTime: props.editingEvent.startTime || '',
      endDate: props.editingEvent.endDate || '',
      endTime: props.editingEvent.endTime || '',
      allDay: props.editingEvent.allDay,
      color: props.editingEvent.color || '#007AFF'
    };
  } else {
    formData.value = {
      title: '',
      description: '',
      startDate: props.selectedDate,
      startTime: '',
      endDate: '',
      endTime: '',
      allDay: true,
      color: '#007AFF'
    };
  }
  errorMessage.value = '';
};

// モーダルを閉じる
const close = () => {
  emit('close');
  initializeForm();
};

// フォーム送信
const handleSubmit = async () => {
  try {
    errorMessage.value = '';
    isSubmitting.value = true;

    if (!formData.value.title.trim()) {
      errorMessage.value = 'タイトルを入力してください';
      return;
    }

    if (isEditMode.value && props.editingEvent) {
      // 更新
      const updated = await eventStore.updateEvent(props.editingEvent.id, formData.value);
      emit('save', updated);
    } else {
      // 新規作成
      const newEvent = await eventStore.addEvent(formData.value);
      emit('save', newEvent);
    }

    close();
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'エラーが発生しました';
  } finally {
    isSubmitting.value = false;
  }
};

// イベント削除
const handleDelete = async () => {
  if (!props.editingEvent) return;
  if (!confirm('この予定を削除してもよろしいですか？')) return;

  try {
    isSubmitting.value = true;
    await eventStore.deleteEvent(props.editingEvent.id);
    emit('delete', props.editingEvent.id);
    close();
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '削除に失敗しました';
  } finally {
    isSubmitting.value = false;
  }
};

// モーダルが開かれた時にフォーム初期化
watch(() => props.isOpen, () => {
  if (props.isOpen) {
    initializeForm();
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.close-btn:active {
  color: #000;
}

.event-form {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007AFF;
  background-color: #f0f8ff;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-checkbox {
  margin-right: 0.5rem;
  cursor: pointer;
}

.color-selector {
  display: flex;
  gap: 0.5rem;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.2s;
}

.color-option:active {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #333;
}

.error-message {
  padding: 0.75rem;
  background: #ffebee;
  color: #c62828;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007AFF;
  color: white;
}

.btn-primary:active:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:active:not(:disabled) {
  background: #d0d0d0;
}

.btn-danger {
  background: #FF3B30;
  color: white;
}

.btn-danger:active:not(:disabled) {
  background: #cc2922;
}
</style>
