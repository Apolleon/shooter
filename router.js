import { createMemoryHistory, createRouter } from "vue-router";

import GameContainer from "@/components/GameContainer.vue";
import HomePage from "@/components/HomePage.vue";

const routes = [
    {path: '/', component: HomePage},
    {path: '/game', component: GameContainer}
]

export const router = createRouter({history: createMemoryHistory(), routes})