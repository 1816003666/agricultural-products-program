<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <RouterView />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  width: 100%;
  height: 100vh;
}

body {
  font-family: "Arial", "Microsoft YaHei", sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
  overflow-x: hidden;
  width: 100%;
  height: 100vh;
}

#app {
  width: 100%;
  height: 100%;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  text-decoration: none;
  color: inherit;
}

ul,
ol {
  list-style: none;
}

button {
  cursor: pointer;
  border: none;
  outline: none;
  background: none;
}

input,
textarea {
  outline: none;
  border: none;
}
</style>
