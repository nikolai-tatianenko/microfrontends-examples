<script setup lang="ts">
import { computed } from "vue";
import { formatDelta } from "../format";

const props = defineProps<{ label: string; value: string; deltaPct: number }>();
const trend = computed(() =>
  props.deltaPct > 0 ? "up" : props.deltaPct < 0 ? "down" : "flat",
);
</script>

<template>
  <div class="tile" data-test-id="stat-tile">
    <dt class="label">{{ label }}</dt>
    <dd class="value">{{ value }}</dd>
    <dd class="delta" :class="trend">{{ formatDelta(deltaPct) }}</dd>
  </div>
</template>

<style scoped>
.tile {
  padding: 16px;
  border: 1px solid var(--bd-color-border-default);
  border-radius: 8px;
  background: var(--bd-color-surface-raised);
}
.label {
  margin: 0;
  font-size: 0.875rem;
  color: var(--bd-color-text-muted);
}
.value {
  margin: 4px 0 0;
  font-size: 1.75rem;
  font-weight: 600;
}
.delta {
  margin: 4px 0 0;
  font-size: 0.875rem;
}
.up {
  color: var(--bd-color-positive);
}
.down {
  color: var(--bd-color-negative);
}
.flat {
  color: var(--bd-color-text-muted);
}
</style>
