<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Talk it Out - AI Mental Health Assistant</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>Talk it Out</h1>
            <p class="subtitle">Your AI companion for emotional well-being</p>
        </header>
        
        <main>
            <div class="api-key-container">
                <input type="password" id="apiKeyInput" placeholder="Enter your Gemini API key" />
                <button id="saveApiKey">Save Key</button>
            </div>
            
            <div class="chat-container" id="chatContainer"></div>
            
            <div class="input-container">
                <input type="text" id="userInput" placeholder="Share what's on your mind...">
                <button class="mic-button" id="micButton" title="Voice Input">🎤</button>
                <button id="sendButton">Send</button>
            </div>
        </main>
    </div>

    <script src="script.js"></script>
</body>
</html>
