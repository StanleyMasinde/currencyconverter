"use strict"
//Register SW later here

//init variables

const resultsDisplay = document.querySelector('#results');

function convertCurrency(amount, from, to) {
    from = 'USD' //document.querySelector('#from');
    to =  'PHP'//document.querySelector('#to');
    const query = from + '_' + to
    const url = 'https://free.currencyconverterapi.com/api/v6/convert?q=' +
        query + '&compact=ultra'

    fetch(url).then(function (response) {
        console.log(response)
    }).catch(function (err) {
        console.log(err)
    })
}

//demo call the function
convertCurrency(12,'USD','PHP');