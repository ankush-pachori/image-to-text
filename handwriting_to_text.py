import cv2
import pytesseract
import webbrowser
from flask import Flask, render_template, request, jsonify
import base64
import numpy as np
import os

app = Flask(__name__)

# Set the path to tesseract executable
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/extract', methods=['POST'])
def extract_text():
    try:
        image_data = request.json['image']
        # Remove the data URL prefix
        image_data = image_data.split(',')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image_array = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply threshold
        _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        
        # Extract text
        text = pytesseract.image_to_string(binary)
        
        return jsonify({'text': text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    
    # Move files to appropriate folders
    if os.path.exists('index.html'):
        os.rename('index.html', 'templates/index.html')
    if os.path.exists('style.css'):
        os.rename('style.css', 'static/style.css')
    if os.path.exists('script.js'):
        os.rename('script.js', 'static/script.js')
    
    app.run(debug=True)