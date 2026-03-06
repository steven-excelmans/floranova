<template>
  <div class="steps-bar" role="navigation">
    <template v-for="(label, index) in steps" :key="index">
      <div
        class="step"
        :class="{
          'step--active': index + 1 === current,
          'step--done': index + 1 < current,
        }"
        @click="$emit('go', index + 1)"
      >
        <div class="step__num">
          <span v-if="index + 1 < current" class="material-icons-outlined" style="font-size: 14px">check</span>
          <template v-else>{{ index + 1 }}</template>
        </div>
        <span class="step__label">{{ label }}</span>
      </div>
      <div
        v-if="index < steps.length - 1"
        class="step__line"
        :class="{ 'step__line--done': index + 1 < current }"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  current: number;
  steps: string[];
}>();

defineEmits<{
  go: [step: number];
}>();
</script>

<style lang="scss" scoped>
.steps-bar {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 20px;
  padding: 0 4px;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &__num {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
    background: var(--border-light);
    color: var(--muted-light);
    transition: all 0.3s ease;
  }

  &__label {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--muted-light);
    white-space: nowrap;
    transition: color 0.3s ease;
  }

  &--active .step__num {
    background: var(--clay);
    color: #fff;
  }

  &--active .step__label {
    color: var(--deep-brown);
  }

  &--done .step__num {
    background: var(--moss);
    color: #fff;
  }

  &--done .step__label {
    color: var(--moss);
  }

  &:hover .step__label {
    color: var(--deep-brown);
  }

  &__line {
    flex: 1;
    height: 1.5px;
    background: var(--border-light);
    margin: 0 10px;
    transition: background 0.3s ease;

    &--done {
      background: var(--moss);
    }
  }
}
</style>
