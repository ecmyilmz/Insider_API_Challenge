const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  use: {
    baseURL: 'https://petstore.swagger.io/v2',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
});
