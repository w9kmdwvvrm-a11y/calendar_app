<script setup lang="ts">
import CalendarView from './views/CalendarView.vue'
</script>

<template>
  <div id="app">
    <CalendarView />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
}

#app {
  background-color: #fff;
}
</style>
