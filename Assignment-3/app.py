from flask import Flask, render_template, request, jsonify
import os
import google.generativeai as genai
from pathlib import Path
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Path to the Notes directory (local to the project)
NOTES_DIR = "notes"

def read_notes_files():
    """Read all text files from the Notes directory and return their content."""
    notes_content = []
    
    try:
        notes_path = Path(NOTES_DIR)
        if not notes_path.exists():
            logger.warning(f"Notes directory does not exist: {NOTES_DIR}")
            return "Notes directory not found."
        
        # Read all text files in the directory
        for file_path in notes_path.rglob("*.txt"):
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read().strip()
                    if content:
                        notes_content.append(f"File: {file_path.name}\n{content}\n")
            except Exception as e:
                logger.error(f"Error reading file {file_path}: {e}")
                continue
        
        # Read Jupyter notebooks
        for file_path in notes_path.rglob("*.ipynb"):
            try:
                import json
                with open(file_path, 'r', encoding='utf-8') as file:
                    notebook = json.load(file)
                    # Extract text from notebook cells
                    notebook_text = []
                    for cell in notebook.get('cells', []):
                        if cell.get('cell_type') == 'markdown' or cell.get('cell_type') == 'code':
                            source = cell.get('source', [])
                            if isinstance(source, list):
                                cell_text = ''.join(source)
                            else:
                                cell_text = str(source)
                            if cell_text.strip():
                                notebook_text.append(cell_text.strip())
                    
                    if notebook_text:
                        content = '\n\n'.join(notebook_text)
                        notes_content.append(f"File: {file_path.name}\n{content}\n")
            except Exception as e:
                logger.error(f"Error reading notebook {file_path}: {e}")
                continue
        
        # Also read other common text file extensions
        for ext in ['.md', '.py', '.js', '.html', '.css', '.json']:
            for file_path in notes_path.rglob(f"*{ext}"):
                try:
                    with open(file_path, 'r', encoding='utf-8') as file:
                        content = file.read().strip()
                        if content:
                            notes_content.append(f"File: {file_path.name}\n{content}\n")
                except Exception as e:
                    logger.error(f"Error reading file {file_path}: {e}")
                    continue
        
        if not notes_content:
            return "No readable text files found in the Notes directory."
        
        return "\n".join(notes_content)
    
    except Exception as e:
        logger.error(f"Error reading notes directory: {e}")
        return f"Error reading notes: {str(e)}"

def ask_gemini(api_key, question, context, bot_role="teacher"):
    """Ask Gemini AI a question with the provided context and role."""
    try:
        # Configure the Gemini API
        genai.configure(api_key=api_key)
        
        # Create the model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Define role-based prompts
        role_prompts = {
            "teacher": """You are a helpful Python programming tutor specializing in ERA V4 course material. Your role is to:
- Explain concepts clearly and thoroughly
- Provide detailed explanations with examples
- Break down complex topics into understandable parts
- Help students understand the 'why' behind concepts
- Be encouraging and supportive""",
            
            "quizzer": """You are a Python programming quiz master specializing in ERA V4 course material. Your role is to:
- Create challenging but fair questions
- Test understanding through practical examples
- Provide immediate feedback on answers
- Ask follow-up questions to deepen understanding
- Challenge students to think critically"""
        }
        
        role_instruction = role_prompts.get(bot_role, role_prompts["teacher"])
        
        # Create the prompt with context and role
        prompt = f"""{role_instruction}

Context from ERA V4 Python notes and files:
{context}

Student Question: {question}

Please respond according to your role. If the answer cannot be found in the provided context, please say so clearly and offer to help with related topics."""

        # Generate response
        response = model.generate_content(prompt)
        
        # Clear the API key from memory immediately after use
        api_key = None
        
        return response.text
    
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        # Clear the API key from memory even on error
        api_key = None
        raise e

@app.route('/')
def index():
    """Serve the main page."""
    return app.send_static_file('index.html')

# Serve static files
@app.route('/<path:filename>')
def static_files(filename):
    """Serve static files."""
    return app.send_static_file(filename)

@app.route('/ask', methods=['POST'])
def ask_question():
    """Handle the question asking endpoint."""
    api_key = None  # Initialize to ensure it's cleared
    try:
        data = request.get_json()
        api_key = data.get('api_key')
        question = data.get('question')
        bot_role = data.get('bot_role', 'teacher')
        
        if not api_key or not question:
            return jsonify({
                'success': False,
                'error': 'API key and question are required'
            }), 400
        
        # Read notes content
        logger.info("Reading notes files...")
        notes_content = read_notes_files()
        
        # Ask Gemini
        logger.info(f"Asking Gemini AI as {bot_role}...")
        response = ask_gemini(api_key, question, notes_content, bot_role)
        
        # Clear API key from memory immediately after successful use
        api_key = None
        
        return jsonify({
            'success': True,
            'response': response
        })
    
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        # Clear API key from memory even on error
        api_key = None
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Check if Notes directory exists
    if not os.path.exists(NOTES_DIR):
        logger.warning(f"Notes directory not found: {NOTES_DIR}")
        logger.info("Please ensure the Notes directory exists and contains text files.")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
