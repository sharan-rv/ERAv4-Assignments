# MNIST Neural Network – journey to obtain an accuracy >95% under 25k parameters

**Two constraints**:  
- **Parameter limit:** < 25,000  
- **Target accuracy:** > 95% in **1 epoch**

---

## 1. Dataset and Preprocessing

- **Dataset:** MNIST (60k training, 10k test)  
- **Transformations:**
  - Random cropping (CenterCrop 22), 10% probability  
  - Resize to 28x28  
  - Random rotation ±15°  
  - Normalization: mean=0.1307, std=0.3081  
- **Batch sizes experimented:** 512 → 128 → 64 → 48

---

## 2. Iteration-wise Experiments

| Iteration | Changes | Parameters | Accuracy (1 epoch) | Notes / Learning |
|-----------|---------|------------|------------------|-----------------|
| 1 | Initial LR = 10.01 → 0.001 | 593,200 | 49.8% | High LR caused divergence initially. |
| 2 | Reduced channels, added MaxPool after 7x7 receptive field, added 1x1 transitional conv | 130,864 | 10.49% | Architectural simplification drastically changed behavior. |
| 3 | Optimizer changed from SGD → Adam | 130,864 | 94.82% | Adam adapts LR per parameter → faster convergence. |
| 4 | Removed last fully connected layer | 39,594 | <span style="color:green">95.05%</span> | Reduced parameters while improving accuracy. |
| 5 | Reduced channels further | <span style="color:green">25,674</span> | 94.89% | Fewer channels maintained accuracy near target. |
| 6 | Reduced channels to 24,498 | <span style="color:green">24,498</span> | 91.62% | Accuracy dropped slightly → over-reduction of capacity. |
| 7 | Increased LR slightly (0.002) | <span style="color:green">24,498</span> | 94.12% | LR tuning improved convergence. |
| 8 | Reduced batch size 512 → 128 | <span style="color:green">24,498</span> | 94.27% | Smaller batch → frequent updates → better generalization. |
| 9 | Added Batch Normalization after conv layers | <span style="color:green">24,498</span> | 93.93% | Stabilized gradients, reduced internal covariate shift. |
| 10 | Reordered BN and MaxPool | <span style="color:green">24,498</span> | <span style="color:green">95.5%</span> | Slight optimization in BN placement improved performance. |
---

## 3. Key Observations and Learnings

1. **Learning Rate (LR) Tuning:**  
   - Small adjustments can significantly impact early convergence.  

2. **Batch Size:**  
   - Smaller batches lead to more frequent updates → better generalization.  
   - Too small batch may increase variance of updates.  

3. **Convolution Layers:**  
   - More layers capture hierarchical features (edges → textures → patterns).  
   - Over-parameterizing → overfitting; under-parameterizing → low accuracy.  

4. **Batch Normalization:**  
   - Normalizes intermediate outputs → faster training, smoother gradients.  
   - Placement affects performance (before/after pooling).  

5. **Adaptive Average Pooling:**  
   - Compresses spatial dimensions → reduces parameters for fully connected layer.  

---

## 4. Final Model Architecture

**Objective:** Achieve >95% accuracy with <25K parameters.

**Structure Overview:**

- **Convolutional Layers (3 layers):**  
  Extract hierarchical features from images, progressing from edges → patterns → textures.

- **Batch Normalization:**  
  Stabilizes training, reduces internal covariate shift, and accelerates convergence.

- **Pooling Layers (Max Pooling):**  
  Compress features, reduce parameters, and retain key information.

- **Adaptive Average Pooling:**  
  Converts feature maps to a fixed size, preparing for the fully connected layer while reducing parameters.

- **Fully Connected Layer:**  
  Maps the flattened feature vector to 10 output classes (digits 0–9).

**Key Metrics:**

- **Parameter Count:** 24,498  
- **Achieved Accuracy (1 Epoch):** 95.50%  

**Notes on Design Choices:**

- Reducing channels strategically minimized parameters without sacrificing performance.  
- Batch normalization after convolutions ensured stable gradient flow.  
- Adaptive pooling replaced larger flatten operations to further compress the model efficiently.  
- Max pooling selectively reduced spatial dimensions while keeping meaningful features.

---

## 5. Accuracy & Loss Curves

- Training Accuracy: Increasing trend, plateaued ~95%  
- Test Accuracy: Matches training → no overfitting  
- Training / Test Loss: Smooth decrease

---

## 6. Conclusion

- Stepwise experimentation is crucial: **LR, batch size, conv channels, BN, pooling**.  
- Tiny adjustments, not just architecture, can push accuracy above 95%.  
- Parameter efficiency achieved under 25k while maintaining target accuracy.

---