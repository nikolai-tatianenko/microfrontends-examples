<template>
  <div class="custom-col-12 custom-lg-4">
    <div class="custom-card custom-summary">
      <span class="custom-title">{{ title }}</span>
      <span class="custom-detail">{{ detail }}</span>
      <span class="custom-count">{{ count }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      required: true,
    },
    count: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'Card';
</style>
