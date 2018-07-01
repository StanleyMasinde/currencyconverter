const BASE_URL = 'https://free.currencyconverterapi.com';
const LIST_OF_COUNTRIES = '/api/v5/countries';
const CONVERT = `/api/v5/convert?q=`;

const defaultCountry = 'Select country';
const defaultCurrency = 'Currency';

let localIndexStorage
let countriesWithCurrencies = [];
let fromCountryInput,
    fromCurrencyInput,
    fromAmountInput,
    fromCurrencySymbol,
    toCountryInput,
    toCurrencyInput,
    toAmountInput,
    toCurrencySymbol,
    resetButton,
    message,
    errorMessage,
    successMessage,
    alert,
    refreshButton,
    dismissButton;


window.onload = () => {
  fromCountryInput = document.getElementById('inputFromCountry');
  fromCurrencyInput = document.getElementById('inputFromCurrency');
  fromAmountInput = document.getElementById('inputFromAmount');
  fromCurrencySymbol = document.getElementById('fromCurrencySymbol');

  toCountryInput = document.getElementById('inputToCountry');
  toCurrencyInput = document.getElementById('inputToCurrency');
  toAmountInput = document.getElementById('inputToAmount');
  toCurrencySymbol = document.getElementById('toCurrencySymbol');

  resetButton = document.getElementById('reset');
  message = document.getElementById('message');
  errorMessage = document.getElementById('error-message');
  successMessage = document.getElementById('success-message');
  alert = document.getElementById('alert');
  alert.style.display = 'none';

  fromCountryInput.addEventListener('change', handleChange);
  fromCurrencyInput.addEventListener('change', handleChange);
  fromAmountInput.addEventListener('input', handleChange);

  toCountryInput.addEventListener('change', handleChange);
  toCurrencyInput.addEventListener('change', handleChange);
  toAmountInput.addEventListener('input', handleChange);

  resetButton.addEventListener('click', handleChange);

  
  MainController.registerServiceWorker();
  openDatabase();
  fetchCountries();
  restoreLastSession();
};

const restoreLastSession = () => {
  localIndexStorage.open()
    .then(idb => localIndexStorage.getItem('last-session', idb))
    .then(session => {
      if (!session) return;
      const { value } = session;
      const {
        fromCountry=defaultCountry,
        fromCurrency=defaultCurrency,
        fromAmount='',
        fromSymbol='#',
        toCountry=defaultCountry,
        toCurrency=defaultCurrency,
        toAmount='',
        toSymbol='#',
      } = value;

      fromCountryInput.value = fromCountry;
      fromCurrencyInput.value = fromCurrency;
      fromAmountInput.value = fromAmount;
      fromCurrencySymbol.innerText = fromSymbol;
      toCountryInput.value = toCountry;
      toCurrencyInput.value = toCurrency;
      toAmountInput.value = toAmount;
      toCurrencySymbol.innerText = toSymbol;
    }).catch(error => console.log(error));
}

const handleChange = (event) => {
  const { name, value } = event.target;
  let target;
  switch (name) {
    case 'inputFromCountry':
      target = countriesWithCurrencies.find(item => item.countryName === value);
      fromCurrencyInput.value = target.currencyId;
      fromCurrencySymbol.innerText = target.symbol || '#';
      convertFromTo(inputFromAmount.value);
      break;
    case 'inputToCountry':
      target = countriesWithCurrencies.find(item => item.countryName === value);
      toCurrencyInput.value = target.currencyId;
      toCurrencySymbol.innerText = target.symbol || '#';
      convertToFrom(inputToAmount.value);
      break;
    case 'inputFromCurrency':
      target = countriesWithCurrencies.find(item => item.currencyId === value);
      fromCountryInput.value = target.countryName;
      fromCurrencySymbol.innerText = target.symbol || '#';
      convertFromTo(inputFromAmount.value);
      break;
    case 'inputToCurrency':
      target = countriesWithCurrencies.find(item => item.currencyId === value);
      toCountryInput.value = target.countryName;
      toCurrencySymbol.innerText = target.symbol || '#';
      convertToFrom(inputToAmount.value);
      break;
    case 'inputFromAmount':
      convertFromTo(value);
      break;
    case 'inputToAmount':
      convertToFrom(value);
      break;
    case 'reset':
      resetSession();
      break;
  }
  saveSession();
}

const resetSession = () => {
  fromCountryInput.value = defaultCountry;
  fromCurrencyInput.value = defaultCurrency;
  fromAmountInput.value =  '';
  fromCurrencySymbol.innerText = '#';
  toCountryInput.value = defaultCountry;
  toCurrencyInput.value = defaultCurrency;
  toAmountInput.value =  '';
  toCurrencySymbol.innerText = '#';
  logSuccess('');
  logInfo('Select countries or currencies');
  saveSession();
}

const saveSession = () => {
  const fromCountry = fromCountryInput.value;
  const fromCurrency = fromCurrencyInput.value;
  const fromAmount = fromAmountInput.value;
  const fromSymbol = fromCurrencySymbol.innerText;
  const toCountry = toCountryInput.value;
  const toCurrency = toCurrencyInput.value;
  const toAmount = toAmountInput.value
  const toSymbol = toCurrencySymbol.innerText;

  const lastSession = {
    fromCountry,
    fromCurrency,
    fromAmount,
    fromSymbol,
    toCountry,
    toCurrency,
    toAmount,
    toSymbol,
  };

  localIndexStorage.open()
    .then(idb => localIndexStorage.setItem('last-session', lastSession, idb))
    .then(() => console.log('Session saved', new Date().getTime()))
    .catch(error => console.log('Failed to save session', error.message));
}

// converts from source country to destination
const convertToFrom = (value) => {
  const amount = value;
  const from = inputToCurrency.value;
  const to = inputFromCurrency.value;
  const callback = result => inputFromAmount.value = result;
  convertCurrency(amount, from, to, callback);
}

// covert back from destination country to source
const convertFromTo = (value) => {
  const amount = value;
  const from = inputFromCurrency.value;
  const to = inputToCurrency.value;
  const callback = result => inputToAmount.value = result;
  convertCurrency(amount, from, to, callback);
}

const fetchCountries = () => {
  logInfo('Fetching data...');
  const url = `${BASE_URL}${LIST_OF_COUNTRIES}`;
  
  localIndexStorage.open().then(idb => localIndexStorage.getItem(url, idb))
    .then(result => {
      if (!result) throw new Error('Item not found');
      const { value } = result;
      return parseResponse(value);
    }).catch((error) => {
      console.log(error.message);
      fetchCountriesFromNetwork(url)
    });
}

const fetchCountriesFromNetwork = (url) => {
  return fetch(url)
  .then(response => response.json())
  .then((json) => {
    if (json) {
      const { results } = json;
      // save result to idb
      localIndexStorage.open()
        .then(idb => localIndexStorage.setItem(url, results, idb))
        .catch(error => console.log(error.message));
      return parseResponse(results);
    }
    logError('Got empty response');
  })
  .catch(() => logError('Working Offline'));
}

const parseResponse = (results) => {
  return getCountries(results)
    .then(countries => populateData(countries));
}

// Retrieve useful information from response data and convert to an array
const getCountries = (results) => {
  return new Promise((resolve) => {
    const values = Object.values(results);
    const countries = values.map(value => ({
      currencyId: value.currencyId,
      countryName: value.name,
      symbol: value.currencySymbol,
    }));
    // make countries avalable to view handlers
    countriesWithCurrencies = countries.sort((a, b) => a.countryName.localeCompare(b.countryName));  
    logInfo('Select countries or currencies');
    return resolve(countries);
  });
}

// populate the view with retrieved data
function populateData(data) {
  for (let index in data) {
    const { countryName, currencyId } = data[index];
    fromCountryInput.appendChild(createOption(countryName));
    toCountryInput.appendChild(createOption(countryName));
    fromCurrencyInput.appendChild(createOption(currencyId));
    toCurrencyInput.appendChild(createOption(currencyId));
  }
}

// Creates a new <option>
function createOption(data) {
  const option = document.createElement('option');
  option.innerText = data;
  return option;
}

function convertCurrency(amount, from, to, cb) {
  if (!from || !to || !amount) return;
  from = encodeURIComponent(from);
  to = encodeURIComponent(to);
  const query = `${from}_${to}`;
  const reciprocal = `${to}_${from}`;
  const url = `${BASE_URL}${CONVERT}${query},${reciprocal}&compact=ultra`;
  localIndexStorage.open().then(idb => localIndexStorage.getItem(query, idb))
    .then(localResponse => {
      if (!localResponse) throw new Error('Query not found in db');
      const value = localResponse.value;
      return calculate(value, amount, from, to, cb)
    })
    .catch(() => {
      return convertCurrencyWithNetwork(url, query, reciprocal, amount, from, to, cb)
    });
}

const convertCurrencyWithNetwork = (url, query, reciprocal, amount, from, to, cb) => {
  return fetch(url)
  .then(response => response.json())
  .then(json => {
    if (json) {
      // retrieve the reciprocal of the query
      const reciprocalValue = json[reciprocal];
      const value = json[query];

      // calculate the original query
      calculate(value, amount, from, to, cb);
      // save both original and reciprocal query response
      return localIndexStorage.open()
          .then(idb => localIndexStorage.setItem(query, value, idb))
          .then(() => localIndexStorage.open())
          .then(idb => localIndexStorage.setItem(reciprocal, reciprocalValue, idb));
    } else {
      const message = `Value not found for ${query}`;
      const err = new Error(message);
      logInfo(message);
      console.error(err);
    }
  })
  .catch(error => {
    logError('Working Offline');
    console.error("Got an error: ", error);
  })
}

const calculate = (val, amount, from, to, cb) => {
  logInfo('Converting...');
  if (val) {
    const total = val * amount;
    cb(Math.round(total * 100) / 100);
    const message = `At ${val} ${to} per ${from}`;
    logSuccess(message);
  }
}

const logError = (error) => {
  message.innerText = '';
  successMessage.innerText = '';
  errorMessage.innerText = error;
}

const logSuccess = (text) => {
  message.innerText = '';
  successMessage.innerText = text;
  errorMessage.innerText = '';
}

const logInfo = (text) => {
  message.innerText = text;
  successMessage.innerText = '';
  errorMessage.innerText = '';
}

function openDatabase() {
  // If the browser doesn't support service worker,
  // or my LocalIndexedStorage is unvailable
  // we don't care about having a database.
  if (!navigator.serviceWorker || !window.LocalIndexedStorage) return Promise.resolve();
  localIndexStorage = window.LocalIndexedStorage;
}

class MainController {
  static registerServiceWorker() {
    if (!navigator.serviceWorker) return;
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      if (!navigator.serviceWorker.controller) {
        return;
      }

      if (registration.waiting) {
        MainController.updateReady(registration.waiting);
        return;
      }

      if (registration.installing) {
        MainController.trackInstalling(registration.installing);
        return;
      }

      registration.addEventListener('updatefound', () => {
        MainController.trackInstalling(registration.installing);
      });

      let refreshing;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
      });
    });
  }

  static trackInstalling(worker) {
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed') {
        MainController.updateReady(worker);
      }
    });
  }

  static updateReady(worker) {
    MainController.showAlert('New version available');
    
    refreshButton = document.getElementById('refresh');
    dismissButton = document.getElementById('dismiss');

    refreshButton.addEventListener('click', () => worker.postMessage({ action: 'skipWaiting' }));
    dismissButton.addEventListener('click', () => alert.style.display = 'none');
  }

  // update-only notification alert
  static showAlert(message) {
    alert.style.display = 'flex';
    const alertMessage = document.getElementById('alert-message');
    alertMessage.innerText = message;
  }
}