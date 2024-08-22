import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import { createRouter } from "vue-router/auto";
import { routes } from "vue-router/auto-routes";
import "dayjs/locale/zh-cn";
import "element-plus/theme-chalk/dark/css-vars.css";
import dayjs from "dayjs";
import { createWebHistory } from "vue-router";
import "@/assets/tailwind.css";

dayjs.locale("zh-cn");

const pinia = createPinia();

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

const app = createApp(App).use(pinia).use(router);

app.mount("#app");
