document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const messageContainer = document.getElementById('message-container');
    
    // ❗ IMPORTANT: Update this with your new ngrok URL
    const LLM_ENDPOINT = 'https://nonappealable-leola-inclinatorily.ngrok-free.dev/generate';

    const sendMessage = async () => {
        const userQuery = messageInput.value.trim();
        if (userQuery === '') return;

        displayMessage(userQuery, 'user');
        messageInput.value = '';
        
        const thinkingMessage = displayMessage('Thinking...', 'bot');

        try {
            thinkingMessage.textContent = 'Reading the policy and generating a response...';

            // 1. Get the content from the page
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await chrome.tabs.sendMessage(tab.id, { type: "GET_POLICY_CONTENT" });
            const policyContent = response.content;

            // 2. Create a single, comprehensive prompt
            const fullPrompt = `
                Based on the following document, please answer the user's question.

                --- Document Text ---
                ${policyContent}
                ---------------------

                --- User's Question ---
                ${userQuery}
                -----------------------
            `;

            // 3. Send the request to the simple backend
            const llmResponse = await fetch(LLM_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: fullPrompt }), // Send the combined prompt
            });

            if (!llmResponse.ok) {
                throw new Error(`API Error: ${llmResponse.status} ${llmResponse.statusText}`);
            }

            const data = await llmResponse.json();
            thinkingMessage.textContent = data.response.trim();

        } catch (error) {
            console.error('Error:', error);
            thinkingMessage.textContent = `Sorry, an error occurred. Details: ${error.message}`;
        }
    };

    // --- Event Listeners and Display Function (no changes here) ---
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    function displayMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = text;
        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight;
        return messageElement;
    }
});