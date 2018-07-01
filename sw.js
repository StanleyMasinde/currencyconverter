const staticAssets = [
    './',
    './css/custom.css',
    './js/index.js',
    './css/app.css',
    '.images/bg.png',
    './manifest.json'
]
//install service worker, create cache and cache all the static files in there
self.addEventListener('install', async event =>{
    const cache = await caches.open('currency_converter_static');
        cache.addAll(staticAssets);
     console.log('sw registration succesful')
    });
     
    
 // Responding with data in cache first   
self.addEventListener('fetch', async event => {
    const req = event.request;
    const url = new URL(req.url);
    if(url.origin === location.origin){
        event.respondWith(cacheFirst(req))
    }else{
        event.respondWith(networkFirst(req))
    }
});     

async function cacheFirst(req) {
    const cashedResponse = await caches.match(req);
    return cashedResponse || fetch(req)
}
async function networkFirst(req){
    const cache = await caches.open('currency_converter_dynamic');
    try{
        const res = await fetch(req);
        cache.put(req, res.clone());
        return res;
    }catch(error){
        const cachedResponse = await cache.match(req);
        return cachedResponse || caches.match('./js/')
    }
}
