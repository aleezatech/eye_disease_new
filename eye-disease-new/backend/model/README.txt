
========================================
EYE DISEASE PREDICTION MODEL
========================================

Training Info:
- Trained on: TensorFlow 2.19.0
- Accuracy: 87.09%
- Total Epochs: 50
- Training Date: 20260125_115900

Classes:
0: Diabetic_Retinopathy
1: Glaucoma
2: Cataract
3: Myopia

Files Included:
================
1. model.keras - Native Keras format (for TF 2.13+)
2. model_compatible.h5 - H5 format (for TF 2.10-2.12)
3. saved_model_export/ - TFLite SavedModel (for deployment)
4. model.weights.h5 - Model weights only
5. model_config.json - Model architecture configuration
6. preprocessing.json - Preprocessing settings
7. README.txt - This file

Usage in Flask with TensorFlow 2.10.1:
======================================

METHOD 1: Load H5 directly (Recommended)
-----------------------------------------
import tensorflow as tf

model = tf.keras.models.load_model('model_compatible.h5', compile=False)


METHOD 2: Rebuild from config + weights
-----------------------------------------
import tensorflow as tf
import json

# Load config
with open('model_config.json', 'r') as f:
    config = json.load(f)

# Rebuild model
model = tf.keras.Model.from_config(config)

# Load weights
model.load_weights('model.weights.h5')


Image Preprocessing:
====================
from PIL import Image
import numpy as np

def preprocess_image(filepath):
    # Load and resize
    img = Image.open(filepath).convert('RGB')
    img = img.resize((224, 224))
    
    # Convert to array
    img_array = np.array(img, dtype=np.float32)
    
    # Normalize to [0, 1]
    img_array = img_array / 255.0
    
    # Scale to [-1, 1] (IMPORTANT!)
    img_array = (img_array - 0.5) * 2.0
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array


Making Predictions:
===================
# Preprocess image
img = preprocess_image('path/to/image.jpg')

# Get predictions
predictions = model.predict(img, verbose=0)

# Get results
confidence = float(np.max(predictions))
predicted_class = int(np.argmax(predictions))
disease = ['Diabetic_Retinopathy', 'Glaucoma', 'Cataract', 'Myopia'][predicted_class]

print(f"Disease: {disease}")
print(f"Confidence: {confidence*100:.2f}%")


IMPORTANT NOTES:
================
- Always use compile=False when loading in TF 2.10.1
- Preprocessing MUST match training (normalize + scale to [-1,1])
- Input shape: (batch_size, 224, 224, 3)
- Output shape: (batch_size, 4)

For issues, check:
- TensorFlow version compatibility
- Image preprocessing steps
- Model file integrity
