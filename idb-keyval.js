/*
Copyright 2016, Jake Archibald

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Source: https://github.com/jakearchibald/idb-keyval
*/
var idbKeyval=function(t){"use strict";function e(t){return new Promise(((e,n)=>{t.oncomplete=t.onsuccess=()=>e(t.result),t.onabort=t.onerror=()=>n(t.error)}))}function n(t,n){const r=indexedDB.open(t);r.onupgradeneeded=()=>r.result.createObjectStore(n);const o=e(r);return(t,e)=>o.then((r=>e(r.transaction(n,t).objectStore(n))))}let r;function o(){return r||(r=n("keyval-store","keyval")),r}function u(t,n){return t("readonly",(t=>(t.openCursor().onsuccess=function(){this.result&&(n(this.result),this.result.continue())},e(t.transaction))))}return t.clear=function(t=o()){return t("readwrite",(t=>(t.clear(),e(t.transaction))))},t.createStore=n,t.del=function(t,n=o()){return n("readwrite",(n=>(n.delete(t),e(n.transaction))))},t.entries=function(t=o()){const e=[];return u(t,(t=>e.push([t.key,t.value]))).then((()=>e))},t.get=function(t,n=o()){return n("readonly",(n=>e(n.get(t))))},t.getMany=function(t,n=o()){return n("readonly",(n=>Promise.all(t.map((t=>e(n.get(t)))))))},t.keys=function(t=o()){const e=[];return u(t,(t=>e.push(t.key))).then((()=>e))},t.promisifyRequest=e,t.set=function(t,n,r=o()){return r("readwrite",(r=>(r.put(n,t),e(r.transaction))))},t.setMany=function(t,n=o()){return n("readwrite",(n=>(t.forEach((t=>n.put(t[1],t[0]))),e(n.transaction))))},t.update=function(t,n,r=o()){return r("readwrite",(r=>new Promise(((o,u)=>{r.get(t).onsuccess=function(){try{r.put(n(this.result),t),o(e(r.transaction))}catch(t){u(t)}}}))))},t.values=function(t=o()){const e=[];return u(t,(t=>e.push(t.value))).then((()=>e))},t}({});
