<script setup lang="ts">
import type { Services } from "@blog/contract";
import { onMounted, ref } from "vue";
import ActivityList from "./components/ActivityList.vue";
import StatTile from "./components/StatTile.vue";
import { loadDashboard, type DashboardData } from "./data";

const props = defineProps<{ services: Services }>();

const data = ref<DashboardData | null>(null);
const error = ref<string | null>(null);
const loading = ref(true);

async function refresh() {
  loading.value = true;
  error.value = null;
  try {
    data.value = await loadDashboard(props.services.apollo);
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : "Could not load the dashboard.";
  } finally {
    loading.value = false;
  }
}

onMounted(refresh);
</script>

<template>
  <main class="dashboard" data-test-id="dashboard">
    <h1>Dashboard</h1>
    <p class="signed-in-as">
      Signed in as {{ services.session.getUser()?.email }}
    </p>

    <p v-if="loading" role="status" data-test-id="dashboard-loading">
      Loading…
    </p>
    <div
      v-else-if="error"
      role="alert"
      class="error"
      data-test-id="dashboard-error"
    >
      <strong>Something went wrong</strong>
      <span>{{ error }}</span>
      <button type="button" data-test-id="dashboard-retry" @click="refresh">
        Try again
      </button>
    </div>
    <template v-else-if="data">
      <dl class="stats">
        <StatTile
          v-for="s in data.stats"
          :key="s.id"
          :label="s.label"
          :value="s.value"
          :delta-pct="s.deltaPct"
        />
      </dl>
      <h2>Recent activity</h2>
      <ActivityList :items="data.recentActivity" />
    </template>
  </main>
</template>

<style>
.dashboard {
  --d-surface: #fff;
  --d-border: #e0e0e0;
  --d-muted: #5f6368;
  --d-good: #1b7f3b;
  --d-bad: #c62828;
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 16px;
  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    sans-serif;
}
@media (prefers-color-scheme: dark) {
  .dashboard {
    --d-surface: #1e1e1e;
    --d-border: #333;
    --d-muted: #9aa0a6;
    --d-good: #66bb6a;
    --d-bad: #ef5350;
  }
}
.dashboard h1 {
  margin: 0 0 4px;
}
.dashboard .signed-in-as {
  margin: 0 0 24px;
  color: var(--d-muted);
}
.dashboard .stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin: 0 0 32px;
}
.dashboard .error {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid var(--d-bad);
  border-radius: 8px;
}
</style>
