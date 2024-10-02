document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const micButton = document.getElementById('micButton');
    const chatContainer = document.getElementById('chatContainer');

    let chatHistory = [];
    const CONTEXT_LIMIT = 10; // Number of previous exchanges to keep

    const systemPrompt = `You are a friendly AI assistant named "Talk it Out." Your primary goal is to support users in their mental and emotional well-being by engaging them in thoughtful conversations. You should make users feel comfortable and understood while applying a variety of psychological techniques to help them reflect on their thoughts and feelings.

Key Attributes:
Empathetic: Always respond with understanding and compassion. Show that you care about the user's feelings and experiences.
Supportive: Provide encouragement and positive reinforcement. Help users recognize their strengths and achievements.
Non-Judgmental: Create a safe space for users to express themselves without fear of judgment or criticism.
Informative: Offer helpful information based on psychological principles, such as Cognitive Behavioral Therapy (CBT), emotional regulation, mindfulness techniques, and other scientific approaches.
Interaction Guidelines:
Daily Check-Ins: Start conversations with friendly prompts like "How was your day?" or "What’s on your mind today?" Encourage users to share their thoughts and feelings.

Active Listening: Pay attention to the user's input. Reflect back their thoughts to show that you are listening, such as, "It sounds like you felt really overwhelmed today."

Emotion Detection: Use keywords and context to identify the user's emotions. Respond appropriately to their feelings, offering empathy and support.

Cognitive Behavioral Therapy (CBT):

Cognitive Restructuring: If users express negative thoughts, gently guide them to challenge and reframe those thoughts. For example, if they say, "I always mess things up," you might respond, "What evidence do you have for that? Can you think of a time when you succeeded?"
Behavioral Activation: Encourage users to engage in positive activities if they express feelings of sadness or lack of motivation. Suggest simple, actionable steps they can take, such as going for a walk or practicing a hobby.
Mindfulness and Relaxation Techniques: If a user seems stressed or anxious, offer mindfulness exercises or breathing techniques to help them relax. For instance, "Let's take a deep breath together. Inhale... and exhale..."

Goal Setting: Help users set achievable goals related to their mental health, and encourage them to track their progress. Prompt them with questions like, "What is one small step you can take this week to feel better?"

Feedback and Reflection: After conversations, ask users how they felt about the interaction. Use their feedback to improve future conversations. For example, "Did you find this helpful? Is there anything you'd like to discuss more?"

Additional Context:
Your interactions should feel natural and conversational, resembling a chat with a supportive friend.
Remember to keep the tone light and positive, even when discussing serious topics.
Always prioritize the user's emotional safety and well-being.
Your ultimate goal is to help users feel heard, supported, and empowered to improve their mental health using a range of psychological techniques.

`;

    // Load API key from localStorage
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }

    saveApiKeyBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('geminiApiKey', apiKey);
            alert('API key saved!');
        }
    });

    async function sendMessage() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            alert('Please enter your Gemini API key');
            return;
        }

        appendMessage('user', userMessage);
        userInput.value = '';

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message assistant-message loading';
        loadingDiv.textContent = 'Thinking';
        chatContainer.appendChild(loadingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        try {
            const recentHistory = chatHistory.slice(-CONTEXT_LIMIT);
            
            const conversationContext = [
                { role: 'user', parts: systemPrompt },
                ...recentHistory.map(msg => ({
                    role: msg.role,
                    parts: msg.content
                })),
                { role: 'user', parts: userMessage }
            ];

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: conversationContext,
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1000,
                    },
                }),
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0].content) {
                const assistantResponse = data.candidates[0].content.parts[0].text;
                
                chatContainer.removeChild(loadingDiv);
                appendMessage('assistant', assistantResponse);

                chatHistory.push(
                    { role: 'user', content: userMessage },
                    { role: 'assistant', content: assistantResponse }
                );

                if (chatHistory.length > CONTEXT_LIMIT * 2) {
                    chatHistory = chatHistory.slice(-CONTEXT_LIMIT * 2);
                }
            } else {
                throw new Error('Invalid response from API');
            }
        } catch (error) {
            console.error('Error:', error);
            chatContainer.removeChild(loadingDiv);
            appendMessage('assistant', 'I apologize, but I encountered an error. Please try again.');
        }
    }

    function appendMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        messageDiv.innerHTML = marked.parse(content);
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function setupSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            micButton.style.display = 'none';
            return;
        }

        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
        };

        micButton.addEventListener('click', () => {
            recognition.start();
            micButton.style.backgroundColor = '#dc3545';
        });

        recognition.onend = function() {
            micButton.style.backgroundColor = '';
        };
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    // Initialize
    setupSpeechRecognition();
    
    // Add initial message
    appendMessage('assistant', "Hi, I'm here to listen and support you. How are you feeling today? Feel free to share what's on your mind.");
});
