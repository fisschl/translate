import ui from "@nuxt/ui/vue-plugin";
import { PiniaColada } from "@pinia/colada";
import { createPinia } from "pinia";
import persisted from "pinia-plugin-persistedstate";
import { createApp, Suspense } from "vue";
import { router } from "@/utils/route.ts";
import App from "./App.vue";
import "@fontsource-variable/noto-sans-sc";
import "@fontsource-variable/open-sans";
import "@fontsource-variable/fira-code";

const pinia = createPinia();
pinia.use(persisted);

const app = createApp(() => h(Suspense, {}, h(App)))
  .use(pinia)
  .use(router)
  .use(PiniaColada)
  .use(ui);

app.mount("#app");
