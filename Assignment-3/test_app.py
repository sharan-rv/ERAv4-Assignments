#!/usr/bin/env python3
"""
Simple test script to verify the application functionality
"""

import os
import sys
from pathlib import Path

# Add current directory to path
sys.path.append('.')

from app import read_notes_files

def test_notes_reading():
    """Test if notes files are being read correctly."""
    print("Testing notes file reading...")
    
    # Check if notes directory exists
    notes_dir = Path("notes")
    if not notes_dir.exists():
        print("❌ Notes directory not found")
        return False
    
    print(f"✅ Notes directory found: {notes_dir.absolute()}")
    
    # List files in notes directory
    files = list(notes_dir.rglob("*"))
    print(f"📁 Found {len(files)} files in notes directory:")
    for file in files:
        if file.is_file():
            print(f"  - {file.name}")
    
    # Test reading notes content
    try:
        content = read_notes_files()
        if content and "No readable text files found" not in content:
            print("✅ Successfully read notes content")
            print(f"📄 Content length: {len(content)} characters")
            print(f"📄 First 200 characters: {content[:200]}...")
            return True
        else:
            print("❌ No readable content found")
            return False
    except Exception as e:
        print(f"❌ Error reading notes: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing AI Chatbot Application")
    print("=" * 40)
    
    success = test_notes_reading()
    
    if success:
        print("\n✅ All tests passed! The application should work correctly.")
        print("\nTo run the application:")
        print("1. Get your Gemini API key from: https://makersuite.google.com/app/apikey")
        print("2. Run: python app.py")
        print("3. Open: http://localhost:5000")
    else:
        print("\n❌ Some tests failed. Please check the setup.")
