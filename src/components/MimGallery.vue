<script setup lang="ts">
import { computed, ref } from "vue";

type GalleryItem = {
  src: string;
  width: number;
  height: number;
  alt: string;
  title: string;
  category: "Art" | "Proof" | "Origin" | "Meme";
};

const props = defineProps<{
  items: GalleryItem[];
}>();

const activeCategory = ref<"All" | GalleryItem["category"]>("All");
const activeItem = ref<GalleryItem | null>(null);

const categories = computed(() => {
  const unique = new Set(props.items.map((item) => item.category));
  return ["All", ...unique] as Array<"All" | GalleryItem["category"]>;
});

const visibleItems = computed(() =>
  activeCategory.value === "All"
    ? props.items
    : props.items.filter((item) => item.category === activeCategory.value),
);

function openItem(item: GalleryItem) {
  activeItem.value = item;
}

function closeItem() {
  activeItem.value = null;
}
</script>

<template>
  <section id="gallery" class="mim-section" aria-label="Magic Internet Money gallery">
    <div class="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-3xl">
        <p class="eyebrow">Gallery</p>
        <h2 class="text-4xl font-black leading-none sm:text-6xl">Artifacts from the timeline</h2>
      </div>
      <div class="flex gap-2 overflow-x-auto pb-1" aria-label="Gallery filters">
        <button
          v-for="category in categories"
          :key="category"
          class="min-h-10 rounded-lg border px-4 text-sm font-black transition"
          :class="
            activeCategory === category
              ? 'border-mim-cyan bg-mim-cyan text-mim-night'
              : 'border-mim-violet/35 bg-mim-violet/10 text-mim-ink hover:border-mim-cyan/70'
          "
          type="button"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
      <button
        v-for="item in visibleItems"
        :key="item.src"
        class="group panel min-h-[260px] overflow-hidden text-left transition hover:border-mim-cyan/70 sm:min-h-[280px]"
        :class="item.width > item.height * 1.7 ? 'lg:col-span-6' : 'lg:col-span-4'"
        type="button"
        @click="openItem(item)"
      >
        <img
          class="h-64 w-full object-cover object-top transition duration-300 group-hover:scale-[1.03]"
          :src="item.src"
          :width="item.width"
          :height="item.height"
          :alt="item.alt"
          loading="lazy"
        />
        <div class="p-4">
          <div class="mb-2 inline-flex rounded-md border border-mim-violet/35 bg-mim-night/70 px-2 py-1 text-xs font-black text-mim-cyan">
            {{ item.category }}
          </div>
          <h3 class="text-lg font-black text-mim-ink">{{ item.title }}</h3>
        </div>
      </button>
    </div>

    <div
      v-if="activeItem"
      class="fixed inset-0 z-50 grid place-items-center bg-mim-night/90 p-4 backdrop-blur"
      role="dialog"
      aria-modal="true"
      @click.self="closeItem"
    >
      <div class="w-full max-w-6xl overflow-hidden rounded-lg border border-mim-cyan/40 bg-mim-coal shadow-glow">
        <div class="flex items-center justify-between gap-4 border-b border-mim-violet/30 p-4">
          <div>
            <p class="m-0 text-xs font-black uppercase tracking-[0.08em] text-mim-cyan">{{ activeItem.category }}</p>
            <h3 class="m-0 mt-1 text-xl font-black">{{ activeItem.title }}</h3>
          </div>
          <button class="button button-secondary min-h-10 px-4" type="button" @click="closeItem">Close</button>
        </div>
        <img
          class="max-h-[78svh] w-full bg-mim-night object-contain"
          :src="activeItem.src"
          :width="activeItem.width"
          :height="activeItem.height"
          :alt="activeItem.alt"
        />
      </div>
    </div>
  </section>
</template>
