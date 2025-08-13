<script setup lang="ts">
defineProps<{
  codeValue: string;
}>();

const { copy, copied } = useClipboard();
</script>

<template>
  <UButton class="group w-full" variant="ghost" color="neutral" @click="copy(codeValue)">
    <code class="flex-1 truncate text-left font-mono text-base font-normal">
      {{ codeValue }}
    </code>
    <UIcon
      :name="copied ? 'i-lucide-check' : 'i-lucide-copy'"
      class="ml-2 opacity-0 transition-opacity group-hover:opacity-100"
    />
  </UButton>
</template>
