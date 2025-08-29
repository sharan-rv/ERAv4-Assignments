# 🧠 CNN Receptive Fields Learning Tool

A Flask web application for understanding how Convolutional Neural Networks process images and how receptive fields grow through network layers.

## 📋 Requirements

- Python 3.7+
- Flask
- NumPy  
- Matplotlib
- Pillow

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Create templates directory:**
   ```bash
   mkdir templates
   ```

3. **Add the index.html file** to the `templates/` folder (provided above)

4. **Run the application:**
   ```bash
   python app.py
   ```

5. **Open your browser** and go to: `http://localhost:5000`

## 🎯 Features

- **Image Upload**: Upload your own grayscale images or use the built-in sample
- **Convolution Visualization**: See how 3x3 edge detection kernels work
- **Pooling Operations**: Understand max pooling and dimension reduction
- **Stride Effects**: Learn how stride affects image downsampling
- **Receptive Field Mapping**: Visualize how receptive fields grow through layers
- **Interactive Learning**: Real-time processing with clear explanations

## 📚 Learning Concepts

### 1. Convolution
- Applied 3x3 edge detection kernel
- Shows feature detection in action
- Maintains spatial dimensions with padding

### 2. Max Pooling
- 2x2 pooling reduces dimensions by half
- Provides translation invariance
- Keeps the strongest features

### 3. Stride Operations
- Demonstrates downsampling effects
- Shows computational efficiency gains
- Reduces spatial resolution

### 4. Receptive Fields
- Layer 0: 1x1 pixel (input)
- Layer 1: 3x3 pixels (after convolution)  
- Layer 2: 4x4 pixels (after pooling)
- Shows how neurons "see" larger areas deeper in the network

## 🎮 Example Images to Try

1. **MNIST Digits**: Download from MNIST dataset
2. **Simple Shapes**: Draw circles, squares, triangles
3. **Text/Letters**: Small character images
4. **Edge Patterns**: Images with clear edges and corners

## 🔧 Project Structure

```

