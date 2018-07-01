dbPromise = function openDatabase() {
    return idb.open('currency_converter', 1, function(upgradeDb) {
        switch (upgradeDb.oldVersion) {
            case 0:
                const currency = upgradeDb.createObjectStore('currencies', {keyPath: 'id'});
        }
    })
  }
  
  function retrievCurrencyFromDatabase() {
    dbPromise().then(function(db) {
        if (!db) return;
        let tx = db.transaction('currencies');
        let currencyStore = tx.objectStore('currencies');
        return currencyStore.getAll();
    }).then(function name(currency) {
       return showDataOnForm(currency);
    }); 
  }



  // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    // if(!window.indexedDB){

    // }
    // open.onerror = (e) => console.log(`an error occured ${e.target.errorCode}`);
    open.onsuccess = (e) =>{
      return  let db = open.result;
    }

    open.onupgradeneeded=(e)=>{
        let db = open.result;
        let store = db.createObjectStore('questionsStore', {keyPath: 'qID'});

    }

// Open (or create) the database
let open = indexedDB.open("MyDatabase", 1);

// Create the schema
open.onupgradeneeded = function() {
    let db = open.result;
    let store = db.createObjectStore("MyObjectStore", {keyPath: "id"});
    let index = store.createIndex("NameIndex", ["name.last", "name.first"]);
};

open.onsuccess = function() {
    // Start a new transaction
    let db = open.result;
    let tx = db.transaction("MyObjectStore", "readwrite");
    let store = tx.objectStore("MyObjectStore");
    let index = store.index("NameIndex");

    // Add some data
    store.put({id: 12345, name: {first: "John", last: "Doe"}, age: 42});
    store.put({id: 67890, name: {first: "Bob", last: "Smith"}, age: 35});
    
    // Query the data
    let getJohn = store.get(12345);
    let getBob = index.get(["Smith", "Bob"]);

    getJohn.onsuccess = function() {
        console.log(getJohn.result.name.first);  // => "John"
    };

    getBob.onsuccess = function() {
        console.log(getBob.result.name.first);   // => "Bob"
    };

    // Close the db when the transaction is done
    tx.oncomplete = function() {
        db.close();
    };
}

