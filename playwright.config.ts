import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

export default defineConfig({
  testDir:'./web/tests/e2e',
  timeout:45_000,
  expect:{timeout:10_000},
  workers:1,
  use:{
    baseURL:'http://127.0.0.1:5274',
    channel:existsSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')?'msedge':undefined,
    headless:true,
    viewport:{width:1440,height:1000},
    trace:'retain-on-failure',
    screenshot:'only-on-failure',
  },
  webServer:{command:'npm run preview -- --port 5274 --strictPort',url:'http://127.0.0.1:5274',reuseExistingServer:false},
});
