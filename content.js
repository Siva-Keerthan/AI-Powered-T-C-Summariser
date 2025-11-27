// This script runs in the context of the webpage.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Listen for a message from the popup
    if (request.type === "GET_POLICY_CONTENT") {
        // Grab all the text from the body of the page
        const pageContent = document.body.innerText;
        
        // Send the content back to the popup
        sendResponse({ content: pageContent });
    }
    // 'return true;' is necessary to indicate that you will be sending a response asynchronously.
    return true; 
});