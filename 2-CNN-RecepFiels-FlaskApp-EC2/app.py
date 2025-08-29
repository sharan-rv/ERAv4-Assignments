from flask import Flask, render_template, request, jsonify, send_file
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image
import io
import base64
import os

app = Flask(__name__)

# Ensure static folder exists
os.makedirs('static', exist_ok=True)

def create_sample_image():
    """Load the MNIST digit image as the default sample"""
    try:
        # Try to load the MNIST image
        img = Image.open('MNIST-Number3.png').convert('L')  # Convert to grayscale
        # Resize to 8x8 for educational clarity
        img_resized = img.resize((8, 8), Image.Resampling.LANCZOS)
        return np.array(img_resized)
    except:
        # Fallback to generated pattern if image loading fails
        img = np.zeros((8, 8), dtype=np.uint8)
        # Create a simple pattern - a cross shape
        img[2:6, 2:6] = 255  # White square in center
        img[1, 1] = 255      # Corner pixels
        img[1, 6] = 255      
        img[6, 1] = 255      
        img[6, 6] = 255      
        img[3:5, 1:7] = 128  # Horizontal line
        img[1:7, 3:5] = 128  # Vertical line
        return img

def apply_convolution(image, kernel, padding=0, stride=1):
    """Apply 2D convolution to image with configurable padding and stride"""
    h, w = image.shape
    kh, kw = kernel.shape
    
    # Calculate output dimensions
    output_h = (h + 2 * padding - kh) // stride + 1
    output_w = (w + 2 * padding - kw) // stride + 1
    
    # Pad image
    padded = np.pad(image, ((padding, padding), (padding, padding)), mode='constant')
    
    # Apply convolution
    output = np.zeros((output_h, output_w))
    for i in range(output_h):
        for j in range(output_w):
            y = i * stride
            x = j * stride
            output[i, j] = np.sum(padded[y:y+kh, x:x+kw] * kernel)
    
    return output

def apply_pooling(image, pool_size=2, pool_type='max', stride=None):
    """Apply pooling operation with configurable parameters"""
    if stride is None:
        stride = pool_size
    
    h, w = image.shape
    output_h = (h - pool_size) // stride + 1
    output_w = (w - pool_size) // stride + 1
    
    output = np.zeros((output_h, output_w))
    
    for i in range(output_h):
        for j in range(output_w):
            y = i * stride
            x = j * stride
            region = image[y:y+pool_size, x:x+pool_size]
            if pool_type == 'max':
                output[i, j] = np.max(region)
            else:  # average
                output[i, j] = np.mean(region)
    
    return output

def calculate_receptive_field(layers_config):
    """Calculate receptive field size for each layer based on configuration"""
    rf_sizes = [1]  # Input layer
    
    for i, layer in enumerate(layers_config):
        if layer['type'] == 'conv':
            kernel_size = layer['kernel_size']
            stride = layer['stride']
            padding = layer['padding']
            
            # RF calculation for convolution
            prev_rf = rf_sizes[-1]
            new_rf = prev_rf + (kernel_size - 1) * stride
            rf_sizes.append(new_rf)
            
        elif layer['type'] == 'pool':
            pool_size = layer['pool_size']
            stride = layer['stride']
            
            # RF calculation for pooling
            prev_rf = rf_sizes[-1]
            new_rf = prev_rf + (pool_size - 1) * stride
            rf_sizes.append(new_rf)
    
    return rf_sizes

def create_layer_visualization(image, layer_output, layer_name, layer_config, filename):
    """Create visualization for a specific layer"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 6))
    
    # Original image
    ax1.imshow(image, cmap='gray', interpolation='nearest')
    ax1.set_title(f'Input to {layer_name}', fontsize=14, fontweight='bold')
    ax1.axis('off')
    
    # Add grid for small images
    if image.shape[0] <= 8:
        for i in range(image.shape[0] + 1):
            ax1.axhline(i - 0.5, color='red', linewidth=0.5, alpha=0.5)
        for j in range(image.shape[1] + 1):
            ax1.axvline(j - 0.5, color='red', linewidth=0.5, alpha=0.5)
    
    # Layer output
    ax2.imshow(layer_output, cmap='gray', interpolation='nearest')
    ax2.set_title(f'{layer_name} Output\n{layer_config}', fontsize=14, fontweight='bold')
    ax2.axis('off')
    
    # Add grid for small images
    if layer_output.shape[0] <= 8:
        for i in range(layer_output.shape[0] + 1):
            ax2.axhline(i - 0.5, color='blue', linewidth=0.5, alpha=0.5)
        for j in range(layer_output.shape[1] + 1):
            ax2.axvline(j - 0.5, color='blue', linewidth=0.5, alpha=0.5)
    
    plt.tight_layout()
    
    # Save to static folder
    filepath = os.path.join('static', filename)
    plt.savefig(filepath, dpi=100, bbox_inches='tight', pad_inches=0.1)
    plt.close()
    
    return filepath

def create_receptive_field_visualization(image, rf_sizes, selected_layer, filename):
    """Create visualization showing receptive field growth through layers"""
    fig, axes = plt.subplots(1, len(rf_sizes), figsize=(4*len(rf_sizes), 4))
    if len(rf_sizes) == 1:
        axes = [axes]
    
    for i, rf_size in enumerate(rf_sizes):
        ax = axes[i]
        ax.imshow(image, cmap='gray', interpolation='nearest')
        
        # Calculate center position
        center_y, center_x = image.shape[0] // 2, image.shape[1] // 2
        
        # Draw receptive field box
        half_rf = rf_size // 2
        x_start = max(0, center_x - half_rf)
        y_start = max(0, center_y - half_rf)
        width = min(rf_size, image.shape[1] - x_start)
        height = min(rf_size, image.shape[0] - y_start)
        
        # Color code based on selection
        if i == selected_layer:
            color = 'red'
            linewidth = 3
            alpha = 0.8
        else:
            color = 'blue'
            linewidth = 2
            alpha = 0.5
        
        rect = patches.Rectangle(
            (x_start - 0.5, y_start - 0.5), 
            width, height, 
            linewidth=linewidth, edgecolor=color, facecolor='none', alpha=alpha
        )
        ax.add_patch(rect)
        
        # Highlight center neuron
        ax.plot(center_x, center_y, 'o', markersize=8, markeredgecolor=color, 
                markerfacecolor='yellow', markeredgewidth=2)
        
        # Add grid
        for grid_i in range(image.shape[0] + 1):
            ax.axhline(grid_i - 0.5, color='gray', linewidth=0.3, alpha=0.3)
        for grid_j in range(image.shape[1] + 1):
            ax.axvline(grid_j - 0.5, color='gray', linewidth=0.3, alpha=0.3)
        
        ax.set_title(f'Layer {i}\nRF: {rf_size}×{rf_size}', fontsize=12, fontweight='bold')
        ax.axis('off')
    
    plt.tight_layout()
    
    # Save to static folder
    filepath = os.path.join('static', filename)
    plt.savefig(filepath, dpi=100, bbox_inches='tight', pad_inches=0.1)
    plt.close()
    
    return filepath

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process_image():
    try:
        data = request.get_json()
        
        # Get layer configurations from frontend
        layers_config = data.get('layers', [])
        
        # Get uploaded image or use sample
        if 'image' in request.files and request.files['image'].filename:
            file = request.files['image']
            img = Image.open(file).convert('L')
            image = np.array(img)
            
            # Resize to manageable size
            if image.shape[0] > 16 or image.shape[1] > 16:
                img_resized = img.resize((8, 8), Image.Resampling.LANCZOS)
                image = np.array(img_resized)
        else:
            image = create_sample_image()
        
        # Process through each layer
        current_image = image.copy()
        layer_outputs = []
        layer_names = []
        layer_configs = []
        
        for i, layer_config in enumerate(layers_config):
            layer_type = layer_config['type']
            
            if layer_type == 'conv':
                # Create kernel based on type
                kernel_type = layer_config.get('kernel_type', 'edge_detection')
                if kernel_type == 'edge_detection':
                    kernel = np.array([[-1, -1, -1],
                                     [-1,  8, -1],
                                     [-1, -1, -1]])
                elif kernel_type == 'blur':
                    kernel = np.array([[1, 1, 1],
                                     [1, 1, 1],
                                     [1, 1, 1]]) / 9
                elif kernel_type == 'sharpen':
                    kernel = np.array([[0, -1, 0],
                                     [-1, 5, -1],
                                     [0, -1, 0]])
                else:
                    # Custom kernel
                    kernel = np.array(layer_config.get('custom_kernel', [[1, 1, 1], [1, 1, 1], [1, 1, 1]]))
                
                # Apply convolution
                output = apply_convolution(
                    current_image, 
                    kernel, 
                    padding=layer_config.get('padding', 0),
                    stride=layer_config.get('stride', 1)
                )
                
                layer_name = f"Conv {i+1}"
                config_str = f"Kernel: {kernel.shape}, Stride: {layer_config.get('stride', 1)}, Padding: {layer_config.get('padding', 0)}"
                
            elif layer_type == 'pool':
                output = apply_pooling(
                    current_image,
                    pool_size=layer_config.get('pool_size', 2),
                    pool_type=layer_config.get('pool_type', 'max'),
                    stride=layer_config.get('stride', 2)
                )
                
                layer_name = f"Pool {i+1}"
                config_str = f"Size: {layer_config.get('pool_size', 2)}×{layer_config.get('pool_size', 2)}, Type: {layer_config.get('pool_type', 'max')}, Stride: {layer_config.get('stride', 2)}"
            
            # Store layer info
            layer_outputs.append(output.copy())
            layer_names.append(layer_name)
            layer_configs.append(config_str)
            
            # Update current image for next layer
            current_image = output.copy()
        
        # Calculate receptive fields
        rf_sizes = calculate_receptive_field(layers_config)
        
        # Create visualizations
        visualizations = {}
        
        # Layer-by-layer visualizations
        for i, (output, name, config) in enumerate(zip(layer_outputs, layer_names, layer_configs)):
            input_img = image if i == 0 else layer_outputs[i-1]
            filename = f'layer_{i+1}.png'
            filepath = create_layer_visualization(input_img, output, name, config, filename)
            visualizations[f'layer_{i+1}'] = filename
        
        # Receptive field visualization
        rf_filename = 'receptive_fields.png'
        rf_filepath = create_receptive_field_visualization(image, rf_sizes, len(layers_config)-1, rf_filename)
        visualizations['receptive_fields'] = rf_filename
        
        # Original image
        orig_filename = 'original.png'
        create_layer_visualization(image, image, 'Original', '8×8 Input', orig_filename)
        visualizations['original'] = orig_filename
        
        return jsonify({
            'success': True,
            'visualizations': visualizations,
            'receptive_fields': rf_sizes,
            'layer_info': [
                {
                    'name': name,
                    'config': config,
                    'input_shape': list(layer_outputs[i-1].shape) if i > 0 else list(image.shape),
                    'output_shape': list(output.shape)
                }
                for i, (name, config, output) in enumerate(zip(layer_names, layer_configs, layer_outputs))
            ],
            'final_shape': list(current_image.shape)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/static/<filename>')
def static_file(filename):
    return send_file(f'static/{filename}')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
