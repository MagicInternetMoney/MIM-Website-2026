const CONTRACT_ADDRESS = "89BZ5RU212yKr3iFdJHyn3ZsR37bS4s8TbmVb2yApump";
const DEXTOOLS_PAIR_ADDRESS = "9pjjP55ajXMPTDZnjhLKvLP4gCLVQhDx9EQi2ywJrc3Z";
const DEXTOOLS_WIDGET_URL = `https://www.dextools.io/widget-chart/en/solana/pe-light/${DEXTOOLS_PAIR_ADDRESS}?theme=dark&chartType=1&chartResolution=15&drawingToolbars=false&chartInUsd=true&showTradeHistory=false`;
const MARKET_DATA_API = `https://api.dexscreener.com/token-pairs/v1/solana/${CONTRACT_ADDRESS}`;
const REFRESH_MS = 5000;

const elements = {
  price: document.querySelector("#stat-price"),
  fdv: document.querySelector("#stat-fdv"),
  marketCap: document.querySelector("#stat-mcap"),
  volume: document.querySelector("#stat-volume"),
  liquidity: document.querySelector("#stat-liquidity"),
  status: document.querySelector("#live-status"),
  tickerPrice: document.querySelector("#ticker-price"),
  tickerPriceCopy: document.querySelector("#ticker-price-copy"),
  tickerChange: document.querySelector("#ticker-change"),
  tickerChangeCopy: document.querySelector("#ticker-change-copy"),
  tickerVolume: document.querySelector("#ticker-volume"),
  tickerVolumeCopy: document.querySelector("#ticker-volume-copy"),
  tickerLiquidity: document.querySelector("#ticker-liquidity"),
  tickerLiquidityCopy: document.querySelector("#ticker-liquidity-copy"),
  chart: document.querySelector("#dex-chart"),
  copy: document.querySelector("#copy-ca"),
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatUsd(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  if (number > 0 && number < 0.01) {
    return `$${number.toPrecision(4)}`;
  }
  return usd.format(number);
}

function compact(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(number);
}

function pickPrimaryPair(pairs) {
  return [...pairs].sort((a, b) => {
    const liquidityA = Number(a?.liquidity?.usd || 0);
    const liquidityB = Number(b?.liquidity?.usd || 0);
    const volumeA = Number(a?.volume?.h24 || 0);
    const volumeB = Number(b?.volume?.h24 || 0);
    return liquidityB + volumeB - (liquidityA + volumeA);
  })[0];
}

function setText(nodes, value) {
  nodes.forEach((node) => {
    if (node) node.textContent = value;
  });
}

function updateChart() {
  if (!elements.chart) return;
  if (elements.chart.src !== DEXTOOLS_WIDGET_URL) {
    elements.chart.src = DEXTOOLS_WIDGET_URL;
  }
}

async function updateDexData() {
  try {
    const response = await fetch(MARKET_DATA_API, { cache: "no-store" });
    if (!response.ok) throw new Error(`Market data ${response.status}`);
    const pairs = await response.json();
    if (!Array.isArray(pairs) || pairs.length === 0) throw new Error("No pairs found");

    const pair = pickPrimaryPair(pairs);
    const price = formatUsd(pair.priceUsd);
    const fdv = formatUsd(pair.fdv);
    const marketCap = formatUsd(pair.marketCap);
    const volume = formatUsd(pair.volume?.h24);
    const liquidity = formatUsd(pair.liquidity?.usd);
    const change = Number(pair.priceChange?.h24);
    const changeText = Number.isFinite(change) ? `24h ${change > 0 ? "+" : ""}${change.toFixed(2)}%` : "24h --";

    elements.price.textContent = price;
    elements.fdv.textContent = fdv;
    elements.marketCap.textContent = marketCap;
    elements.volume.textContent = volume;
    elements.liquidity.textContent = liquidity;

    setText([elements.tickerPrice, elements.tickerPriceCopy], price);
    setText([elements.tickerChange, elements.tickerChangeCopy], changeText);
    setText([elements.tickerVolume, elements.tickerVolumeCopy], `Vol ${compact(pair.volume?.h24)}`);
    setText([elements.tickerLiquidity, elements.tickerLiquidityCopy], `Liq ${compact(pair.liquidity?.usd)}`);

    const direction = change >= 0 ? "var(--green)" : "var(--red)";
    elements.tickerChange.style.color = direction;
    elements.tickerChangeCopy.style.color = direction;
    elements.status.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })} from ${pair.dexId || "the market data feed"}.`;

    updateChart();
  } catch (error) {
    elements.status.textContent = "Live market data is temporarily unavailable.";
  }
}

elements.copy?.addEventListener("click", async () => {
  await navigator.clipboard.writeText(CONTRACT_ADDRESS);
  elements.copy.textContent = "Copied";
  window.setTimeout(() => {
    elements.copy.textContent = "Copy";
  }, 1400);
});

updateDexData();
window.setInterval(updateDexData, REFRESH_MS);
