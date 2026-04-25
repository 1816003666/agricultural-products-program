import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import { lazyLoad } from "./directives/lazyLoad";

const app = createApp(App);
app.directive('lazy', lazyLoad);
app.use(router).mount("#app");
