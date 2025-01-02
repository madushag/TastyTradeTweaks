// ==UserScript==
// @name         Tasty Tweaks
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Tasty Tweaks
// @author       Madusha G.
// @match        https://my.tastytrade.com/app.html*/trading/positions/capital-requirements
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tastytrade.com
// ==/UserScript==

const version = '1.0';
let checkboxes = [];
let intialRequirementValue = 0;
let cashBalanceValue = 0;   
let currentUrl = window.location.href;

// Create a MutationObserver to watch for changes in the URL
const observer = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        onUrlChange();
    }
});

// Start observing the document for changes in the child nodes
observer.observe(document, { childList: true, subtree: true });


// Function to handle URL change
function onUrlChange() {
    if (window.location.href.includes('positions/capital-requirements')) {

        // Wait until button with class "capital-requirements-table-row" is present in the DOM and run Tasty_Init() method after it has been loaded 
        const capitalRequirementsTableRow = document.querySelector('button.capital-requirements-table-row');
        if (capitalRequirementsTableRow) {
            Tasty_Init();
        }   
        else {
            // Keep checking if the button with class "capital-requirements-table-row" is present in the DOM and run Tasty_Init() method after it has been loaded 
            setTimeout(() => {
                onUrlChange();
            }, 1000);
        }   

    }
}


function Tasty_Init() {
    // Select child buttons with a role of "checkbox", that are present within a parent div with role "presentation"
    checkboxes = document.querySelectorAll('div[role="presentation"] button[role="checkbox"]');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('click', handleCheckboxClick);
    });
}

// handle the click event for the checkbox  
function handleCheckboxClick(event) {

    const initialRequirementValueElement = document.querySelector('div.capital-requirements.table button').children[4];

    let sumOfInitialRequirementValuesToDisplay = 0;

    // store the initial requirement value for the capital requirements table, if it is not already stored  
    if (intialRequirementValue === 0) {
        // get the initial requirement value from the capital requirements table
        intialRequirementValue = parseFloat(initialRequirementValueElement.textContent.replace(/[$,]/g, ''));
    }

    // store the cash balance value for the account, if it is not already stored  
    if (cashBalanceValue === 0) {
        // show balances popup
        document.querySelector('button.balance-button').click();

        const cashBalanceValueElement = document.querySelector('div.account-balance-panel-container div.entry').children[1];

        // get cash balance value
        cashBalanceValue = parseFloat(cashBalanceValueElement.textContent.replace(/[$,]/g, ''));
    }


    // iterate over all the checkboxes and get the sum of the initial requirement values, where the data-state attribute is set to "checked"
    // and if none of the checkboxes are checked, then set the sumOfInitialRequirementValues to the initial requirement value   
    let sumOfInitialRequirementValues = 0;
    checkboxes.forEach(checkbox => {
        if (checkbox.getAttribute('data-state') === "checked") {
            sumOfInitialRequirementValues += parseFloat(checkbox.closest('button[role="row"]').children[4].textContent.replace(/[$,]/g, ''));
        }
    });


    // if sumOfInitialRequirementValues is zero, then set it to the initial requirement value
    if (sumOfInitialRequirementValues === 0) {
        sumOfInitialRequirementValuesToDisplay = intialRequirementValue;
    }   
    else {
        sumOfInitialRequirementValuesToDisplay = sumOfInitialRequirementValues;
    }

    // show the sum of the initial requirement values as a currency value
    initialRequirementValueElement.textContent = sumOfInitialRequirementValuesToDisplay.toLocaleString('en-US', { style: 'currency', currency: 'USD' });


    // if the sum of the initial requirement values is greater than the cash balance value, then set the background color of the initial requirement value element to red
    // remove the background color
    if (sumOfInitialRequirementValues > cashBalanceValue) {
        initialRequirementValueElement.style.backgroundColor = 'red';
    }
    else {
        initialRequirementValueElement.style.backgroundColor = '';
    }

}
