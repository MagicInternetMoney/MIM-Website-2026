<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  contract: string;
}>();

const copied = ref(false);

async function copyContract() {
  await navigator.clipboard.writeText(props.contract);
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 1500);
}
</script>

<template>
  <button
    class="inline-flex min-h-10 max-w-full items-center gap-2 rounded-lg border border-mim-cyan/35 bg-mim-night/75 px-3 text-left text-xs font-black uppercase tracking-[0.08em] text-mim-cyan shadow-glow transition hover:border-mim-green hover:text-mim-green"
    type="button"
    aria-label="Copy MIM contract address"
    @click="copyContract"
  >
    <span>ca:</span>
    <code class="min-w-0 truncate normal-case tracking-normal text-mim-ink/90">{{ contract.slice(0, 5) }}...{{ contract.slice(-5) }}</code>
    <span class="text-mim-green">{{ copied ? "Copied" : "Copy" }}</span>
  </button>
</template>
