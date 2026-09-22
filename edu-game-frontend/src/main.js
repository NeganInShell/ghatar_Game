import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app'),
})

// ثبت سرویس‌ورکر PWA — رویدادها را به window می‌فرستد تا App.svelte بنر «نسخه جدید» نشان دهد
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        window.dispatchEvent(new CustomEvent('pwa:update'));
      },
      onOfflineReady() {
        window.dispatchEvent(new CustomEvent('pwa:ready'));
      }
    });
  }).catch(() => { /* PWA در حالت dev فعال نیست */ });
}

export default app
