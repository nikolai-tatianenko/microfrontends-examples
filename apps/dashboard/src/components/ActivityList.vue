<script setup lang="ts">
import { formatWhen } from "../format";

defineProps<{
  items: readonly {
    id: string;
    user: string;
    action: string;
    at: string;
  }[];
}>();
</script>

<template>
  <ol class="list" data-test-id="activity-list">
    <li v-for="item in items" :key="item.id" class="row">
      <span class="who">{{ item.user }}</span>
      <span>{{ item.action }}</span>
      <time class="when" :datetime="item.at">{{ formatWhen(item.at) }}</time>
    </li>
  </ol>
</template>

<style scoped>
.list {
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--bd-color-border-default);
  border-radius: 8px;
  background: var(--bd-color-surface-raised);
}
.row {
  display: grid;
  grid-template-columns: 1fr 2fr 11rem;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--bd-color-border-default);
}
.row:last-child {
  border-bottom: 0;
}
.who {
  font-weight: 600;
}
.when {
  text-align: right;
  color: var(--bd-color-text-muted);
  font-size: 0.875rem;
}
@media (max-width: 600px) {
  .row {
    grid-template-columns: 1fr;
  }
  .when {
    text-align: left;
  }
}
</style>
