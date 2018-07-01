"use strict";
 
window.onload = () => { 

   //checking to see if service worker exist in the clients browser
   if('serviceWorker' in navigator){
    try{
      navigator.serviceWorker.register('./sw.js');
      console.log('sw registered successfully');
    }catch(error){
      console.log('sw registration failed')
    }
  }

  // assigning html elements to variables
  let conversionButton = document.getElementById('convert');
  let amount = document.getElementById('Amount');
  let from = document.getElementById('from');
  let to = document.getElementById('to');
  let displayResult = document.getElementById('displayResult');
 
  amount.focus(); //keeping the cursor in the amount field on each reload
    
  // making fetch request to the currency api server
  fetch('https://free.currencyconverterapi.com/api/v5/currencies')
    .then((response) => {
        return response.json();
    })
    .then(function(myJson) {
      let currencies = myJson.results;     //Object containing currencyName, currencySymbol and id 

      // looping through the currencies object for values
      for(const currency in currencies){
        const money = currencies[currency].currencyName;    //extracting the name of the currency     
        const moneyId = currencies[currency].id;    //extracting the name of the currency     
        const node = document.createElement('option');      //create an <option> element
        const text = `(${moneyId}) ${money}`;
        const textnode = document.createTextNode(text);    // puttin the name of currency in varible
          node.setAttribute('value', moneyId);                //adding value to the option element
          node.appendChild(textnode); 
          from.appendChild(node);            
      }    
      for(const currency in currencies){
        const money = currencies[currency].currencyName;    //extracting the name of the currency     
        const moneyId = currencies[currency].id;    //extracting the name of the currency     
        const node = document.createElement('option');      //create an <option> element
        const text = `(${moneyId}) ${money}`;
        const textnode = document.createTextNode(text);    // puttin the name of currency in varible
          node.setAttribute('value', moneyId);                //adding value to the option element
          node.appendChild(textnode); 
          to.appendChild(node);        
      }    
  });

  //handling currency conversion
  function convertCurrency(amount, fromCurrency1, toCurrency1 ){

    //encoding the query to be pushed
    let fromCurrency = encodeURIComponent(fromCurrency1);
    let toCurrency = encodeURIComponent(toCurrency1);
    let query = `${fromCurrency}_${toCurrency}`;
    // const url = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;
    const url = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;
    
    // fetch the conversion rate
    fetch(url)
      .then((response) => {
          return response.json();
      }).then(rated => {
        let val = rated[query];
        if(val){                                            //checking to see if the query was succesfle
          let total = val * amount;                         // computing the total
          let newTotal = Math.round(total * 100) / 100;     // round the converted amount to a whole number
          displayResult.value = newTotal;
          console.log(newTotal);                            //log the converted amount to the console
        } else{
          console.log('sommthing bad happened');
        }   
    })    
  }

  //attching conversion functionality to button     
  conversionButton.addEventListener("click", (e) => {
    e.preventDefault();
    const convertFrom =from.options[from.selectedIndex].value;
    const convertTo =to.options[to.selectedIndex].value;
    const enteredAmount = amount.value;

    convertCurrency(enteredAmount,convertFrom, convertTo);
        
  });
   
}