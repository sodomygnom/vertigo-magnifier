(function(){"use strict";function o(e){return`https://lens.google.com/uploadbyurl?url=${e}`}[{id:"search",title:"search via google.lens 🔍"},{id:"screenshot",title:"screenshot 📷"},{id:"zoom-inc",title:"zoom 🔆 +15%"},{id:"zoom-dec",title:"zoom 🔅 -15%"},{id:"brightness-inc",title:"brightness 🔆 +25%"},{id:"brightness-dec",title:"brightness 🔅 -25%"},{id:"mirror",title:"mirror 🪞"},{id:"rotate-left",title:"rotate left ↶"},{id:"rotate-right",title:"rotate right ↷"},{id:"invert",title:"invert 🙿"}].forEach(e=>browser.contextMenus.create({...e,contexts:["all"]})),browser.runtime.onMessage.addListener((e,t)=>{var s;const r=(s=t.tab)==null?void 0:s.id;e.searchImageGoogle&&browser.tabs.create({url:o(e.src)}),e.captureRect&&r&&browser.tabs.captureTab(r,{rect:e.rect}).then(i=>{browser.tabs.sendMessage(r,{from:"background",uri:i,screenshot_ok:!0})})}),browser.contextMenus.onClicked.addListener((e,t)=>{if(!(t!=null&&t.id)){console.error("Tab ID is undefined. Cannot send message.");return}switch(e.menuItemId){case"search":browser.tabs.sendMessage(t.id,{search:!0});break;case"screenshot":browser.tabs.sendMessage(t.id,{screenshot:!0});break;default:browser.tabs.sendMessage(t.id,{transform:e.menuItemId});break}})})();
