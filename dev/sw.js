if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(s[o])return;let t={};const d=e=>i(e,o),l={module:{uri:o},exports:t,require:d};s[o]=Promise.all(n.map((e=>l[e]||d(e)))).then((e=>(r(...e),t)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-B20XQKjE.css",revision:null},{url:"assets/index-DPTj2tbF.js",revision:null},{url:"assets/workbox-window.prod.es5-DFjpnwFp.js",revision:null},{url:"index.html",revision:"e0954ddbaf3cd92cb262162a6c3fd7aa"},{url:"./logo-192.svg",revision:"b9d7fc9ef3b0cb3a75212d3499c344bd"},{url:"./144x144.png",revision:"217bae5e11b9c3cfafc47d280ee3dcf5"},{url:"manifest.webmanifest",revision:"51d951be54b95c497f27c4894d536d47"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
