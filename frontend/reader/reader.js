import { API_BASE } from "../../lib/index.js";

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const bookTitle = document.getElementById('book-title');
const bookAuthor = document.getElementById('book-author');
const bookImage = document.getElementById('book-image');
const bookDescription = document.getElementById('book-description');
const bookPrice = document.getElementById('book-price');
const signOutBtn = document.getElementById('signOutBtn');
const profile = document.getElementById('profile');
const userBtn = document.querySelector('.user-btn');
const navLink = document.getElementById('navLink');

// State variables
let currentBook = null;
let conversationHistory = [];
let isWaitingForResponse = false;

// Navigation links setup
function displayNavLinks() {
    const navLinks = [
        { label: 'Home', link: '/' },
        { label: 'Dashboard', link: '/frontend/dashboard/dashboard.html' },
        { label: 'Books', link: '/frontend/books' },
        { label: 'Back to Search', link: '/frontend/' }
    ];
    
    if (navLink) {
        navLink.innerHTML = '';
        navLinks.forEach((link) => {
            const navLinkElement = document.createElement('li');
            const navLinkHref = document.createElement('a');
            navLinkHref.innerText = link.label;
            navLinkHref.href = link.link;
            navLinkElement.className = 'nav-link';
            navLinkElement.appendChild(navLinkHref);
            navLink.appendChild(navLinkElement);
        });
    }
}

// Check user session with better error handling
const checkUserSession = () => {
    try {
        const session = window.localStorage.getItem('userSession');
        if (!session) {
            window.location.href = '/frontend/sign-in/sign-in.html';
            return;
        }

        const user = JSON.parse(session);
        if (!user || !user.userName) {
            throw new Error('Invalid session');
        }

        if (profile) {
            const userInitial = user.userName.charAt(0).toUpperCase();
            profile.innerHTML = `
                <div class="user-profile" style="cursor: pointer; background-color: var(--accent-color); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600;">${userInitial}</div>
                <p class="user-name">${user.userName}</p>`;
            
            // Add click listener to profile
            const userProfile = profile.querySelector('.user-profile');
            if (userProfile) {
                userProfile.addEventListener('click', displayUserBtn);
            }
        }
    } catch (error) {
        console.error('Session error:', error);
        window.localStorage.removeItem('userSession');
        window.location.href = '/frontend/sign-in/sign-in.html';
    }
}

// Display user button (made globally accessible)
function displayUserBtn() {
    if (userBtn) {
        if (userBtn.style.display === 'none' || userBtn.style.display === '') {
            userBtn.style.display = 'flex';
        } else {
            userBtn.style.display = 'none';
        }
    }
}

// Make displayUserBtn globally accessible
window.displayUserBtn = displayUserBtn;

// Sign Out Functionality
if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
        try {
            window.localStorage.removeItem('userSession');
            window.location.href = '/frontend/sign-in/sign-in.html';
        } catch (error) {
            console.error('Sign out error:', error);
            window.location.href = '/frontend/sign-in/sign-in.html';
        }
    });
}

// Load book details with enhanced error handling
async function loadBook() {
    try {
        const bookId = window.location.search.substring(1);
        
        if (!bookId || bookId.trim() === '') {
            console.warn('No book ID provided');
            window.location.href = '/frontend/';
            return;
        }

        // Show loading state
        bookTitle.textContent = 'Loading book...';
        bookDescription.textContent = 'Please wait...';

        const response = await fetch(`${API_BASE}/books`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch books: ${response.statusText}`);
        }

        const books = await response.json();
        
        if (!Array.isArray(books) || books.length === 0) {
            throw new Error('No books found');
        }

        currentBook = books.find(b => b && b.id && String(b.id) === String(bookId));

        if (!currentBook) {
            console.error('Book not found with ID:', bookId);
            alert('Book not found. Redirecting...');
            window.location.href = '/frontend/';
            return;
        }

        // Populate book details
        if (!currentBook.imageSrc) {
            bookImage.style.display = 'none';
        } else {
            bookImage.src = currentBook.imageSrc;
            bookImage.alt = currentBook.name || 'Book Cover';
            bookImage.style.display = 'block';
            bookImage.onerror = () => {
                bookImage.style.display = 'none';
            };
        }

        bookTitle.textContent = currentBook.name || 'Untitled';
        bookAuthor.textContent = currentBook.author || 'Unknown Author';
        bookDescription.textContent = currentBook.description || 'No description available';
        bookPrice.textContent = `$${(currentBook.price || 0).toFixed(2)}`;

        // Initialize conversation with enhanced context
        conversationHistory = [
            {
                role: 'system',
                content: `You are a helpful and engaging book reading assistant for "${currentBook.name}" by ${currentBook.author}. The book's description: "${currentBook.description}". 
                Your role is to help users understand, analyze, and enjoy this book. 
                Provide thoughtful, concise, and relevant responses about the book's content, themes, characters, and plot.
                Be conversational and encouraging.`
            }
        ];

        // Clear welcome messages and show initial message
        chatMessages.innerHTML = '';
        displayInitialMessage();

    } catch (error) {
        console.error('Error loading book:', error);
        bookTitle.textContent = 'Error Loading Book';
        bookDescription.textContent = error.message || 'An error occurred while loading the book.';
        displayMessage('Sorry, I couldn\'t load the book information. Please try again or go back to the home page.', false);
    }
}

// Display initial welcome message
function displayInitialMessage() {
    displayMessage(`📖 Welcome! I'm ready to help you explore "${currentBook.name}" by ${currentBook.author}. What would you like to discuss about this book?`, false);
}

// Display message with better formatting and auto-scroll
function displayMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
    messageDiv.style.opacity = '0';
    messageDiv.style.animation = 'messageSlideIn 0.3s ease-out forwards';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Preserve line breaks and basic formatting
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Auto-scroll to latest message
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 10);
}

// Display typing indicator
function displayTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai';
    messageDiv.id = 'typing-indicator';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = '<span class="ai-loading-spinner">⏳</span> AI is thinking...';
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Send message with better state management
async function sendMessage(userMessage) {
    const trimmedMessage = userMessage.trim();
    
    if (!trimmedMessage) {
        chatInput.focus();
        return;
    }

    if (isWaitingForResponse) {
        return; // Prevent double submission
    }

    if (!currentBook) {
        displayMessage('Please wait for the book to load completely.', false);
        return;
    }

    // Display user message
    displayMessage(trimmedMessage, true);
    chatInput.value = '';
    chatInput.disabled = true;
    chatSendBtn.disabled = true;
    isWaitingForResponse = true;

    // Add user message to history
    conversationHistory.push({
        role: 'user',
        content: trimmedMessage
    });

    try {
        // Show typing indicator
        displayTypingIndicator();

        // Generate AI response
        const aiResponse = generateAIResponse(trimmedMessage);
        
        // Simulate thinking delay for better UX (500ms - 1500ms)
        const delay = 300 + Math.random() * 800;
        
        await new Promise(resolve => setTimeout(resolve, delay));

        // Remove typing indicator and display response
        removeTypingIndicator();
        displayMessage(aiResponse, false);
        
        conversationHistory.push({
            role: 'assistant',
            content: aiResponse
        });

    } catch (error) {
        console.error('Error in sendMessage:', error);
        removeTypingIndicator();
        displayMessage('😕 Sorry, I encountered an error. Could you please rephrase your question?', false);
    } finally {
        // Re-enable input
        chatInput.disabled = false;
        chatSendBtn.disabled = false;
        isWaitingForResponse = false;
        chatInput.focus();
    }
}

// Enhanced AI response generator with better pattern matching
function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    const book = currentBook;
    
    if (!book) {
        return "I'm still loading the book information. Please try again in a moment.";
    }

    // Helper function for better keyword matching with word boundaries
    const hasKeyword = (str, keywords) => {
        return keywords.some(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            return regex.test(str);
        });
    };

    // Summarization
    if (hasKeyword(message, ['summarize', 'summary', 'sum up', 'brief', 'overview'])) {
        return `📚 **${book.name} - Summary**\n\n${book.description}\n\nThis work combines compelling storytelling with meaningful themes. Would you like to explore a specific aspect, such as the characters, plot, or themes in more detail?`;
    }

    // Main themes
    if (hasKeyword(message, ['theme', 'themes', 'main idea', 'central idea', 'message', 'moral'])) {
        return `🎯 **Themes in ${book.name}**\n\nThis book explores several key themes including character development, human relationships, and personal growth. Through ${book.author}'s narrative, these themes are woven into the story in thought-provoking ways.\n\nWhich theme interests you most? I'd love to discuss it further!`;
    }

    // Characters discussion
    if (hasKeyword(message, ['character', 'characters', 'protagonist', 'antagonist', 'people', 'person'])) {
        return `👥 **Characters in ${book.name}**\n\n${book.author} has crafted well-developed characters that drive the narrative forward. Each character brings their own perspective and journey to the story, creating rich interpersonal dynamics.\n\nThe relationships between these characters explore complex human emotions and personal growth.\n\nWould you like to discuss a specific character or their development?`;
    }

    // Plot discussion
    if (hasKeyword(message, ['plot', 'story', 'happens', 'what happens', 'storyline', 'events'])) {
        return `🎬 **Plot of ${book.name}**\n\nThe narrative unfolds through: ${book.description}\n\nThe story's structure keeps readers engaged while allowing time to reflect on deeper meanings and character motivations. The events build upon each other to create a compelling reading experience.\n\nWould you like me to elaborate on specific plot points or story developments?`;
    }

    // Writing style
    if (hasKeyword(message, ['writing', 'style', 'prose', 'language', 'author\\'s style', 'how is it written'])) {
        return `✍️ **Writing Style**\n\n${book.author}'s writing style in "${book.name}" is engaging and thoughtful. The prose creates an immersive experience that draws readers into the world of the book.\n\nThe narrative voice is accessible yet profound, making complex themes understandable and relatable.\n\nWhat aspects of the writing resonate most with you?`;
    }

    // General book information
    if (hasKeyword(message, ['book', 'about', 'tell me', 'what is', 'information', 'details'])) {
        return `📖 **About ${book.name}**\n\n**Author:** ${book.author}\n**Price:** $${(book.price || 0).toFixed(2)}\n\n**Description:** ${book.description}\n\nThis book offers readers an engaging blend of compelling storytelling and meaningful content. Whether you're looking for entertainment, insight, or both, this book has much to offer.\n\nWhat would you like to know more about?`;
    }

    // Author information
    if (hasKeyword(message, ['author', 'written by', 'who wrote'])) {
        return `🖊️ **About the Author: ${book.author}**\n\n${book.author} is the author of "${book.name}". Their work is characterized by thoughtful storytelling and meaningful exploration of human experiences.\n\nIn this book, ${book.author} brings their distinctive voice and perspective to create a memorable reading experience.\n\nWould you like to discuss the author's impact on the story?`;
    }

    // Price and availability
    if (hasKeyword(message, ['price', 'cost', 'how much', 'money', 'buy', 'purchase'])) {
        return `💰 **Pricing & Availability**\n\n"${book.name}" is available for **$${(book.price || 0).toFixed(2)}**.\n\nIt's a worthwhile investment for anyone interested in compelling literature and meaningful storytelling. At this price point, you're getting access to a well-crafted work.\n\nWould you like to proceed with reading or do you have other questions?`;
    }

    // Recommendations
    if (hasKeyword(message, ['recommend', 'should i read', 'worth reading', 'good'])) {
        return `⭐ **My Recommendation**\n\nI highly recommend "${book.name}" by ${book.author}! Here's why:\n\n✓ Engaging storytelling\n✓ Well-developed characters and themes\n✓ Meaningful and thought-provoking content\n✓ Quality writing\n\nBased on the book's description and themes, it offers both entertainment and deeper insights. It's definitely worth your time!\n\nReady to dive in?`;
    }

    // Difficulty/Reading level
    if (hasKeyword(message, ['difficult', 'hard', 'easy', 'reading level', 'complex'])) {
        return `📊 **Reading Level & Complexity**\n\n"${book.name}" is written in an accessible yet thoughtful manner. While it explores meaningful themes, the prose is crafted to be engaging and understandable for most readers.\n\nThe book offers depth for those seeking it, while remaining enjoyable for casual reading. It's a great balance of entertainment and substance.\n\nDo you have concerns about any particular aspects?`;
    }

    // Genre or category
    if (hasKeyword(message, ['genre', 'category', 'type', 'kind of book', 'what kind'])) {
        return `🏷️ **Genre & Category**\n\n"${book.name}" is a captivating work that appeals to readers interested in meaningful storytelling and character-driven narratives.\n\nThe themes and content make it suitable for readers who enjoy works that blend engaging plots with thoughtful exploration of human experiences.\n\nAre you familiar with similar works?`;
    }

    // Time/Duration to read
    if (hasKeyword(message, ['how long', 'read', 'time', 'duration', 'pages'])) {
        return `⏱️ **Reading Time**\n\nThe time to complete "readingbook.name}" varies by reader and reading speed. The book is paced to allow for both immersive reading sessions and thoughtful reflection between chapters.\n\nMost readers find it to be an engrossing read that keeps them turning pages while still leaving room for contemplation.\n\nWould you like tips on getting the most out of your reading?`;
    }

    // Asking for help/confusion
    if (hasKeyword(message, ['help', 'confused', 'confused', 'understand', 'explain', 'what do you mean'])) {
        return `🤝 **How Can I Help?**\n\nI'm here to help you get the most out of "${book.name}"! I can:\n\n• Summarize the story and main points\n• Explain themes and character development\n• Discuss plot points and story arcs\n• Provide context and background information\n• Answer specific questions about the book\n• Offer reading recommendations\n\nFeel free to ask me anything about the book. What would you like to know?`;
    }

    // Default response - encourage engagement
    return `💭 **Great Question!**\n\nThat's an interesting perspective on "${book.name}"! \n\n${book.description}\n\nYour question shows thoughtful engagement with the material. Here are some related topics we could explore:\n\n• The characters and their development\n• Key themes and their significance\n• Specific scenes or moments that stood out\n• The author's writing style and narrative techniques\n\nWhat aspect would you like to dive deeper into?`;
}

// Quick prompt handler
function sendQuickPrompt(prompt) {
    if (!isWaitingForResponse) {
        chatInput.value = prompt;
        chatInput.focus();
        sendMessage(prompt);
    }
}

// Make sendQuickPrompt globally accessible
window.sendQuickPrompt = sendQuickPrompt;

// Setup event listeners with error handling
function setupEventListeners() {
    // Chat send button click
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', () => {
            if (chatInput && !isWaitingForResponse) {
                sendMessage(chatInput.value);
            }
        });
    }

    // Chat input enter key
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isWaitingForResponse) {
                    sendMessage(chatInput.value);
                }
            }
        });

        // Focus styling
        chatInput.addEventListener('focus', () => {
            chatInput.style.borderColor = 'var(--accent-color)';
        });

        chatInput.addEventListener('blur', () => {
            chatInput.style.borderColor = 'var(--border-color)';
        });
    }
}

// Initialize application
async function initialize() {
    try {
        // Display navigation
        displayNavLinks();
        
        // Check session
        checkUserSession();
        
        // Setup event listeners
        setupEventListeners();
        
        // Load book
        await loadBook();
        
        // Focus on input
        if (chatInput) {
            chatInput.focus();
        }
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
