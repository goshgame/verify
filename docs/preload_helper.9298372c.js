!function(){"use strict";var t="/".replace(/([^/])$/,"$1/"),e=location.pathname,n=e.startsWith(t)&&decodeURI("/".concat(e.slice(t.length)));if(n){var a=document,c=a.head,r=a.createElement.bind(a),i=function(t,e,n){var a,c=e.r[t]||(null===(a=Object.entries(e.r).find((function(e){var n=e[0];return new RegExp("^".concat(n.replace(/\/:[^/]+/g,"/[^/]+").replace("/*","/.+"),"$")).test(t)})))||void 0===a?void 0:a[1]);return null==c?void 0:c.map((function(t){var a=e.f[t][1],c=e.f[t][0];return{type:c.split(".").pop(),url:"".concat(n.publicPath).concat(c),attrs:[["data-".concat(e.b),"".concat(e.p,":").concat(a)]]}}))}(n,{"p":"@goshfe/verify","b":"webpack","f":[["vconsole-lib.8cee4546.async.js",31],["shared-9QEFIRcyVe02Pn3i7kfQKAKATc_.a7fd2c39.chunk.css",170],["shared-9QEFIRcyVe02Pn3i7kfQKAKATc_.46b75eab.async.js",170],["p__Index__index.9bf808c5.chunk.css",500],["p__Index__index.b64f59cf.async.js",500],["recoil-lib.6faa83ed.async.js",712],["layouts__index.3a12af8f.chunk.css",717],["layouts__index.f3f68e54.async.js",717]],"r":{"/":[1,2,3,4,0,5,6,7]}},{publicPath:"./"});null==i||i.forEach((function(t){var e,n=t.type,a=t.url;if("js"===n)(e=r("script")).src=a,e.async=!0;else{if("css"!==n)return;(e=r("link")).href=a,e.rel="preload",e.as="style"}t.attrs.forEach((function(t){e.setAttribute(t[0],t[1]||"")})),c.appendChild(e)}))}}();