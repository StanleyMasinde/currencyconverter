"use strict"
//Register SW later here


//first get a list of all currencies
fetch('https://free.currencyconverterapi.com/api/v6/currencies')
    .then((response) => {
        console.log(response)
        return response.json();
    })
    .then(function (responseJson) {
        let currencies = responseJson.results;

        //loop through the currencies
        for (const currency in currencies) {
            const Symbol = currencies[currency].currencySymbol;
            const Name = currencies[currency].currencyName;;
            const Id = currencies[currency].id;
            var node = document.createElement("option");
            node.setAttribute('value', Id);
            var textnode = document.createTextNode(`(${Id}) ${Name}`);
            node.appendChild(textnode);
            document.getElementById("from").appendChild(node);
        }
        for (const currency in currencies) {
            const Symbol = currencies[currency].currencySymbol;
            const Name = currencies[currency].currencyName;;
            const Id = currencies[currency].id;
            var node = document.createElement("option");
            node.setAttribute('value', Id);
            var textnode = document.createTextNode(`(${Id}) ${Name}`);
            node.appendChild(textnode);
            document.getElementById("to").appendChild(node);
        }
    })
    .catch((err) => {
        console.log(err);
    })

//init variables
function convertCurrency(amount, from, to) {
    from = document.querySelector('#from').value;
    to = document.querySelector('#to').value;
    amount = document.getElementById('value').value;
    const query = `${from}_${to}`
    const url = `https://free.currencyconverterapi.com/api/v6/convert?q=${query}&compact=ultra`


    fetch(url).then(function (response) {
            return response.json();
        }).then(rates => {
            let rate = rates[query];
            const finalResult = rate * amount;
            if (isNaN(finalResult)) {
                alert('you need to fill all the fields')
            } else {
                document.getElementById('results').innerHTML = finalResult;
            }
        })
        .catch(function (err) {
            console.log(err)
        })
}

//demo call the function