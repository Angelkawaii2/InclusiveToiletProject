if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(s[o])return;let t={};const l=e=>i(e,o),d={module:{uri:o},exports:t,require:l};s[o]=Promise.all(n.map((e=>d[e]||l(e)))).then((e=>(r(...e),t)))}}define(["./workbox-7cfec069"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index-DEKyK_m9.css",revision:null},{url:"assets/index-MhdlFCJ_.js",revision:null},{url:"index.html",revision:"46e0f61b59601bb8954e6ba05d017bfc"},{url:"registerSW.js",revision:"402b66900e731ca748771b6fc5e7a068"},{url:"./logo-192.svg",revision:"d9a152f89d4f04dff2e43655e8168bdf"},{url:"./144x144.png",revision:"217bae5e11b9c3cfafc47d280ee3dcf5"},{url:"./logo-512.svg",revision:"e6ae088b652153153b21df8a32d89292"},{url:"manifest.webmanifest",revision:"51d951be54b95c497f27c4894d536d47"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
