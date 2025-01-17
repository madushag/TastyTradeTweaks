// ==UserScript==
// @name         Tasty Tweaks
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Tasty Tweaks
// @author       Madusha G.
// @match        https://my.tastytrade.com/app.html*/trading/positions/capital-requirements
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tastytrade.com
// @resource     TASTYCSS file://C:/DevStuff/TastyTradeTweaks/tasty.styles.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

const version = '1.0';
let checkboxes = [];
let intialRequirementValue = 0;
let cashBalanceValue = 0;   
let currentUrl = window.location.href;
let accountSelected = false;

// Create a MutationObserver to watch for changes in the URL
const observer = new MutationObserver(() => {

    // if the current url is the capital requirements page, then run handleCapitalRequirementsPage() method
    if (window.location.href !== currentUrl) {  
        currentUrl = window.location.href;
        if (window.location.href.includes('positions/capital-requirements')) {
            handleCapitalRequirementsPage();
        }
    }

    // add a 5 second delay before running the code
    setTimeout(() => {
        
        // Inject CSS if it is not already injected
        injectStylesIfNeeded();

       

        // click the accounts button
        clickAccountsButton();

    }, 5000);
});

// Start observing the document for changes in the child nodes
observer.observe(document, { childList: true, subtree: true });


// Function to handle the capital requirements page
function handleCapitalRequirementsPage() {
    // if the current url is the capital requirements page, then run Tasty_Init() method
    if (window.location.href.includes('positions/capital-requirements')) {

        // Wait until button with class "capital-requirements-table-row" is present in the DOM 
        // and run attachEventHandlersOnCapitalRequirementsPage() method after it has been loaded 
        const capitalRequirementsTableRow = document.querySelector('button.capital-requirements-table-row');
        if (capitalRequirementsTableRow) {
            attachEventHandlersOnCapitalRequirementsPage();
        }
        else {
            // Keep checking if the button with class "capital-requirements-table-row" is present in the DOM and run Tasty_Init() method after it has been loaded 
            setTimeout(() => {
                handleCapitalRequirementsPage();
            }, 1000);
        }   

    }
    
    // else if the current url is trading positions page, then run Tasty_Init() method
    else if (window.location.href.includes('trading/positions')) {
        // handleTradingPositionsPage();
    }
}

// 

// Attach click event handlers to all the checkboxes in the capital requirements table
function attachEventHandlersOnCapitalRequirementsPage() {
    // Select child buttons with a role of "checkbox", that are present within a parent div with role "presentation"
    checkboxes = document.querySelectorAll('div[role="presentation"] button[role="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('click', handleCheckboxClick);
    });
}

// handle the click event for the checkbox  
function handleCheckboxClick(event) {

    const initialRequirementValueElement = document.querySelector('div.capital-requirements.table button').children[5];

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

        // now that we have the cash balance value, hide the balances popup by hiding the element with class "account-balance-panel"
        document.querySelector('.account-balance-panel').style.display = 'none';

        // get cash balance value
        cashBalanceValue = parseFloat(cashBalanceValueElement.textContent.replace(/[$,]/g, ''));
    }


    // iterate over all the checkboxes and get the sum of the initial requirement values, where the data-state attribute is set to "checked"
    // and if none of the checkboxes are checked, then set the sumOfInitialRequirementValues to the initial requirement value   
    let sumOfInitialRequirementValues = 0;
    checkboxes.forEach(checkbox => {
        if (checkbox.getAttribute('data-state') === "checked") {
            sumOfInitialRequirementValues += parseFloat(checkbox.closest('button[role="row"]').children[5].textContent.replace(/[$,]/g, ''));
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

    // if the sum of the initial requirement values is greater than the cash balance value, then add the tasty-requirement-warning 
    // class to the initial requirement value element and create a popup with the text "Insufficient Cash Balance"
    if (sumOfInitialRequirementValues > cashBalanceValue) {

        // add the tasty-requirement-warning class to the initial requirement value element
        initialRequirementValueElement.classList.add('tasty-requirement-warning');

        // show a stylized popup with the text "Insufficient Cash Balance" but only if the popup is not already present,
        // and if the popup is already present, then update the text of the popup
        const existingPopup = initialRequirementValueElement.parentElement.querySelector('.tasty-balance-popup');
        if (!existingPopup) {
            const popup = document.createElement('div');
            popup.className = 'tasty-balance-popup';
            popup.innerHTML = 'Insufficient Cash Balance : <strong>' + (cashBalanceValue - sumOfInitialRequirementValues).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) + '</strong>';
            popup.style.top = initialRequirementValueElement.offsetTop - 10 + 'px';
            popup.style.left = initialRequirementValueElement.offsetLeft + 'px';
            initialRequirementValueElement.parentElement.appendChild(popup);
        }
        else {
            existingPopup.innerHTML = 'Insufficient Cash Balance : <strong>' + (cashBalanceValue - sumOfInitialRequirementValues).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) + '</strong>';
        }
    }
    else {
        // remove the tasty-requirement-warning class from the initial requirement value element and remove the popup
        initialRequirementValueElement.classList.remove('tasty-requirement-warning');
        const existingPopup = initialRequirementValueElement.parentElement.querySelector('.tasty-balance-popup');
        if (existingPopup) {
            existingPopup.remove();
        }
    }
}


function clickAccountsButton() {
    // if the current url is trading positions page, then click the accounts button
    if (window.location.href.includes('trading/positions')) {   
        // if the account is not selected, then click the accounts button
        if (!accountSelected) {
            // if the accounts button is present, then click it, otherwise keep checking if it is 
            // present and run clickAccountsButton() method after it has been loaded  
            const accountsButton = document.querySelector('button.accounts-button');
            if (accountsButton) {
                accountsButton.click();
                accountSelected = true;

                // wait for button with class "trading-account-selector-item-header" to be present in the DOM, and then click
                setTimeout(() => {
                    clickTradingAccountSelectorItemHeader(accountsButton);
                }, 1000);
            }
            else {
                // Keep checking if the accounts button is present and run clickAccountsButton() method after it has been loaded 
                setTimeout(() => {
                    clickAccountsButton();
                }, 3000);
            }
        }
    }
}


function clickTradingAccountSelectorItemHeader(accountsButton) {
    // Wait for the trading account selector panel to be present
    const tradingAccountSelectorPanel = document.querySelector('div.trading-account-selector-panel');
    if (tradingAccountSelectorPanel) {
        //  within the 4th div child with class "trading-account-selector-item"
        const tradingAccountSelectorItem = tradingAccountSelectorPanel.querySelector('div.trading-account-selector-item:nth-child(5)');
        if (tradingAccountSelectorItem) {
            //  there is a button with class "trading-account-selector-item-header" and within that button, click on the 4th child 
            // div with class "header-focused"
            var tradingAccountSelectorItemHeader = tradingAccountSelectorItem.querySelector('button.trading-account-selector-item-header');
            var checkboxContainer = tradingAccountSelectorItemHeader.querySelector('div.header-focused');

            // add a 1 second delay before clicking the checkbox    
            setTimeout(() => {
                //select the account checkbox
                var checkbox = checkboxContainer.querySelector('div[role="checkbox"]').querySelector('button');
                checkbox.click();

                // hide the div with class "popover fixed accounts-panel"
                var accountsPanel = document.querySelector('div.popover.fixed.accounts-panel');
                accountsPanel.style.display = 'none';
                accountSelected = true;

                // // add a 1 second delay before hiding the trading account selector panel
                // setTimeout(() => {
                //     // hide the trading account selector panel by clicking the accounts button
                //     accountsButton.click();
                //     accountSelected = true;
                // }, 1000);       
            }, 500);   

        }
        else {
            // Keep checking if the trading account selector panel is present
            setTimeout(() => {
                clickTradingAccountSelectorItemHeader();
            }, 1000);
        }
    }
}


// function handleTradingPositionsPage() {
    //     // look if a div with class "card trading-content" is present in the DOM
    //     const tradingContentCard = document.querySelector('div.card.trading-content');
    //     if (tradingContentCard) {
    
    //         // within the tradingContentCard, get the third child div with class "boule-table"
    //         const bouleTable = tradingContentCard.querySelector('div.boule-table');
    //         //get the first child within the bouleTable with class "boule-table-row boule-table-header"
    //         const tableHeaderRow = bouleTable.querySelector('div.boule-table-row.boule-table-header');
    //         //get the 5th child which is a button type within the tableHeaderRow with class "boule-table-header-cell"
    //         const fifthColumn = tableHeaderRow.querySelector('button.boule-table-header-cell:nth-child(5)');
    //         //adjust the width of fifthColumn to 65px
    //         fifthColumn.style.width = '65px';
    
    //         // within bouleTable, get the child div with a role of "presentation" which contains all the data rows
    //         const dataRowsContainerTopLevel = bouleTable.querySelector('div[role="presentation"]');
    //         // within dataRowsContainerTopLevel, get the div with a role of "status" which contains all the data rows
    //         const dataRowsContainer = dataRowsContainerTopLevel.querySelector('div[role="status"]');
    
    //         // dataRowsContainer contains all the data rows, which are button elements with a role of "row", and each such button has a div or span with a class of "boule-table-cell" 
    //         // to represent a column. Given this, iterate over all data rows and adjust the width of the 4th column to 65px    
    //         const dataRows = dataRowsContainer.querySelectorAll('button[role="row"]');
    //         dataRows.forEach(row => {
    //             const fourthColumn = row.querySelector('div.boule-table-cell:nth-child(4), span.boule-table-cell:nth-child(4)');
    //             fourthColumn.style.width = '65px';
    //         });
            
    //     }
    //     else {
    //         // Keep checking if the div with class "card trading-content" is present in the DOM and run handleTradingPositionsPage() method after it has been loaded 
    //         setTimeout(() => {
    //             handleCapitalRequirementsPage();
    //         }, 1000);
    //     }   
    // }


//---------------------- HELPER FUNCTIONS ----------------------

// Inject the styles if they are not already injected
function injectStylesIfNeeded() {
    if (!document.getElementById("tasty-toast-styles")) {
        const css = GM_getResourceText("TASTYCSS");
        const style = document.createElement("style");
        style.id = "tasty-toast-styles";
        style.textContent = css;
        document.head.appendChild(style);
    }
}