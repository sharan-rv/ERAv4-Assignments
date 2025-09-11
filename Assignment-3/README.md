# ERA V4 AI Tutor

A specialized AI tutoring application designed for ERA V4 Python course material. Uses Google's Gemini AI to provide personalized learning experiences based on your class notes.

## Features

- **🔒 Secure API Key Handling**: Your Gemini API key is never stored and is deleted immediately after each request
- **👨‍🏫 Dual Bot Roles**: Choose between Teacher mode (detailed explanations) or Quizzer mode (test your knowledge)
- **📚 ERA V4 Specialized**: Specifically designed for ERA V4 Python course material
- **📖 Multi-format Support**: Reads various file types (txt, md, py, js, html, css, json, ipynb)
- **📓 Jupyter Notebook Processing**: Intelligently processes your .ipynb files
- **⚡ Real-time Responses**: Instant AI-powered answers to your questions

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Add your notes files to the `notes/` directory

3. Run the application:
```bash
python app.py
```

4. Open your browser and go to `http://localhost:5000`

## Usage

1. **Enter your Gemini API key** (securely handled - never stored)
2. **Choose your bot role**:
   - **👨‍🏫 Teacher**: Get detailed explanations and step-by-step guidance
   - **❓ Quizzer**: Test your knowledge with questions and challenges
3. **Type your question** about the ERA V4 Python notes
4. **Click "Ask Question"** to get personalized AI responses

## Bot Roles

### 👨‍🏫 Teacher Mode
- Provides detailed explanations of concepts
- Breaks down complex topics into understandable parts
- Offers step-by-step guidance
- Encourages learning with supportive responses

### ❓ Quizzer Mode
- Creates challenging questions based on your notes
- Tests your understanding through practical examples
- Provides immediate feedback on your answers
- Challenges you to think critically

## Deployment to EC2

1. Upload all files to your EC2 instance
2. Install Python and pip
3. Install dependencies: `pip install -r requirements.txt`
4. Run: `python app.py`
5. Access via your EC2 public IP on port 5000

## File Structure

```
├── app.py              # Flask backend
├── requirements.txt    # Python dependencies
├── static/
│   └── index.html     # Web interface
├── notes/             # Your notes and files
└── README.md          # This file
```
