"use strict"
//Register SW later here


//first get a list of all currencies
fetch('https://free.currencyconverterapi.com/api/v6/currencies')
    .then(function (response) {
        const currencies = response;
        console.log(currencies)
    }).catch(function (err) {
        console.log(err);
    })

//init variables
function convertCurrency(amount, from, to) {
    from = 'USD' //document.querySelector('#from');
    to = 'PHP' //document.querySelector('#to');
    const query = from + '_' + to
    const url = `https://free.currencyconverterapi.com/api/v6/convert?q=${query}&compact=ultra`

    fetch(url).then(function (response) {
        const rate = response.json();
        console.log(rate)
    }).catch(function (err) {
        console.log(err)
    })
}

//demo call the function
convertCurrency(12, 'USD', 'PHP');