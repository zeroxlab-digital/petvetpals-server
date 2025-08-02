// run this anywhere (e.g. tools/generateVapid.js)
import webpush from 'web-push';

const keys = webpush.generateVAPIDKeys();
console.log(keys);