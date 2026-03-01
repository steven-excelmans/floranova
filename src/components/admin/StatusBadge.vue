<template>
  <span class="status-badge" :class="`status-badge--${status}`">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PlantStatus } from 'src/types/plant';

const props = defineProps<{ status: PlantStatus }>();

const labels: Record<PlantStatus, string> = {
  pending: 'Pending',
  unverified: 'Unverified',
  verified: 'Verified',
};

const label = computed(() => labels[props.status]);
</script>

<style lang="scss" scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;

  &--pending {
    color: var(--clay);
    background: var(--clay-pale);
  }

  &--unverified {
    color: var(--cal-indoor);
    background: rgba(125, 161, 184, 0.12);
  }

  &--verified {
    color: var(--moss);
    background: var(--moss-pale);
  }
}
</style>
