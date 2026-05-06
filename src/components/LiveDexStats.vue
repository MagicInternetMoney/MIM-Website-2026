<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    mode?: "ticker" | "markets";
  }>(),
  { mode: "markets" },
);

const CONTRACT_ADDRESS = "89BZ5RU212yKr3iFdJHyn3ZsR37bS4s8TbmVb2yApump";
const DEX_API = `https://api.dexscreener.com/token-pairs/v1/solana/${CONTRACT_ADDRESS}`;
const JUPITER_PLUGIN_URL = `https://plugin.jup.ag/?inputMint=So11111111111111111111111111111111111111112&outputMint=${CONTRACT_ADDRESS}`;
const PUMP_URL = `https://pump.fun/coin/${CONTRACT_ADDRESS}`;
const REFRESH_MS = 5000;

type DexPair = {
  pairAddress?: string;
  dexId?: string;
  priceUsd?: string;
  fdv?: number;
  marketCap?: number;
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  priceChange?: { h24?: number };
  txns?: { h24?: { buys?: number; sells?: number } };
};

const pair = ref<DexPair | null>(null);
const status = ref("Waiting for the first market update.");
const copied = ref(false);
let timer: number | undefined;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatUsd(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  if (number > 0 && number < 0.01) return `$${number.toPrecision(4)}`;
  return usd.format(number);
}

function compact(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(number);
}

function pickPrimaryPair(pairs: DexPair[]) {
  return [...pairs].sort((a, b) => {
    const liquidityA = Number(a.liquidity?.usd || 0);
    const liquidityB = Number(b.liquidity?.usd || 0);
    const volumeA = Number(a.volume?.h24 || 0);
    const volumeB = Number(b.volume?.h24 || 0);
    return liquidityB + volumeB - (liquidityA + volumeA);
  })[0] ?? null;
}

async function updateDexData() {
  try {
    const response = await fetch(DEX_API, { cache: "no-store" });
    if (!response.ok) throw new Error(`DexScreener ${response.status}`);

    const pairs = (await response.json()) as DexPair[];
    if (!Array.isArray(pairs) || pairs.length === 0) throw new Error("No pairs found");

    pair.value = pickPrimaryPair(pairs);
    status.value = `Updated ${new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    })} from ${pair.value?.dexId || "DexScreener"}.`;
  } catch {
    status.value = "Live market data is temporarily unavailable.";
  }
}

async function copyContract() {
  await navigator.clipboard.writeText(CONTRACT_ADDRESS);
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 1400);
}

const price = computed(() => formatUsd(pair.value?.priceUsd));
const fdv = computed(() => formatUsd(pair.value?.fdv));
const marketCap = computed(() => formatUsd(pair.value?.marketCap));
const volume = computed(() => formatUsd(pair.value?.volume?.h24));
const liquidity = computed(() => formatUsd(pair.value?.liquidity?.usd));
const h24 = computed(() => Number(pair.value?.priceChange?.h24));
const changeText = computed(() =>
  Number.isFinite(h24.value) ? `24h ${h24.value > 0 ? "+" : ""}${h24.value.toFixed(2)}%` : "24h --",
);
const changeClass = computed(() => (h24.value >= 0 ? "text-mim-green" : "text-mim-red"));
const chartSrc = computed(() => {
  const id = pair.value?.pairAddress || CONTRACT_ADDRESS;
  return `https://dexscreener.com/solana/${id}?embed=1&theme=dark`;
});

onMounted(() => {
  updateDexData();
  timer = window.setInterval(updateDexData, REFRESH_MS);
});

onUnmounted(() => {
  if (timer) window.clearInterval(timer);
});
</script>

<template>
  <div>
    <div v-if="props.mode === 'ticker'" class="overflow-hidden border-y border-mim-violet/30 bg-mim-night" aria-label="Live price ticker">
      <div class="flex min-h-12 w-max items-center gap-7 px-4 text-sm text-mim-paper/72 [animation:mim-marquee_24s_linear_infinite]">
        <template v-for="copy in 2" :key="copy">
          <span class="font-black text-mim-ink">MIM</span>
          <strong class="text-mim-cyan">{{ price }}</strong>
          <span :class="changeClass">{{ changeText }}</span>
          <span>Vol {{ compact(pair?.volume?.h24) }}</span>
          <span>Liq {{ compact(pair?.liquidity?.usd) }}</span>
          <span>Magic Internet Money</span>
        </template>
      </div>
    </div>

    <section v-if="props.mode === 'markets'" id="buy" class="mim-section grid items-center gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
      <div>
        <p class="eyebrow">How to buy</p>
        <h2 class="text-4xl font-black leading-none sm:text-6xl">Trade MIM live</h2>
        <ol class="my-7 grid list-decimal gap-3 pl-5 leading-relaxed text-mim-paper/72">
          <li>Open the live Pump.fun market or connect a Solana wallet with Jupiter Plugin.</li>
          <li>Use SOL or USDC as the input token.</li>
          <li>Confirm the output token is the MIM contract.</li>
          <li>Review price impact, then swap.</li>
        </ol>
        <div class="mb-4 flex flex-col gap-3 sm:flex-row">
          <a class="button button-primary" :href="PUMP_URL" target="_blank" rel="noreferrer">Open Pump.fun</a>
          <a class="button button-secondary" href="#chart">View Live Chart</a>
        </div>
        <div class="panel grid grid-cols-[1fr_auto] gap-2 p-4">
          <span class="text-sm text-mim-paper/65">Contract address</span>
          <button class="rounded-lg border border-white/15 px-3 py-1 text-sm font-black text-mim-ink" type="button" @click="copyContract">
            {{ copied ? "Copied" : "Copy" }}
          </button>
          <code class="col-span-2 break-words text-sm text-mim-cyan">{{ CONTRACT_ADDRESS }}</code>
        </div>
      </div>
      <div class="h-[650px] overflow-hidden rounded-lg border border-white/15 bg-mim-coal sm:h-[720px]">
        <iframe
          class="h-full w-full border-0"
          title="Jupiter Plugin swap"
          :src="JUPITER_PLUGIN_URL"
          loading="lazy"
        />
      </div>
    </section>

    <section v-if="props.mode === 'markets'" id="tokenomics" class="mim-section">
      <div class="mb-7 max-w-3xl">
        <p class="eyebrow">Live tokenomics</p>
        <h2 class="text-4xl font-black leading-none sm:text-6xl">Dex data, refreshed every 5 seconds</h2>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <article class="panel min-h-32 p-5">
          <span class="mb-4 block text-sm text-mim-paper/65">Price</span>
          <strong class="block break-words text-xl font-black lg:text-2xl">{{ price }}</strong>
        </article>
        <article class="panel min-h-32 p-5">
          <span class="mb-4 block text-sm text-mim-paper/65">FDV</span>
          <strong class="block break-words text-xl font-black lg:text-2xl">{{ fdv }}</strong>
        </article>
        <article class="panel min-h-32 p-5">
          <span class="mb-4 block text-sm text-mim-paper/65">Market Cap</span>
          <strong class="block break-words text-xl font-black lg:text-2xl">{{ marketCap }}</strong>
        </article>
        <article class="panel min-h-32 p-5">
          <span class="mb-4 block text-sm text-mim-paper/65">24h Volume</span>
          <strong class="block break-words text-xl font-black lg:text-2xl">{{ volume }}</strong>
        </article>
        <article class="panel min-h-32 p-5">
          <span class="mb-4 block text-sm text-mim-paper/65">Liquidity</span>
          <strong class="block break-words text-xl font-black lg:text-2xl">{{ liquidity }}</strong>
        </article>
        <article class="panel min-h-32 p-5">
          <span class="mb-4 block text-sm text-mim-paper/65">Holders</span>
          <strong class="block break-words text-xl font-black lg:text-2xl">Live on chart</strong>
        </article>
      </div>
      <p class="mt-4 text-sm text-mim-paper/65">{{ status }}</p>
    </section>

    <section v-if="props.mode === 'markets'" id="chart" class="mx-auto w-full max-w-[1400px] px-0 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div class="mim-shell mb-7 px-4 sm:px-0">
        <p class="eyebrow">Dex Screener</p>
        <h2 class="text-4xl font-black leading-none sm:text-6xl">Live chart</h2>
      </div>
      <div class="h-[72svh] min-h-[620px] overflow-hidden border-y border-white/15 bg-mim-coal sm:rounded-lg sm:border">
        <iframe class="h-full w-full border-0" title="MIM live Dex Screener chart" :src="chartSrc" loading="lazy"></iframe>
      </div>
    </section>

  </div>
</template>
