import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form
from sklearn.cluster import KMeans
from collections import Counter

app = FastAPI(title="Floria CV Microservice", version="1.0.0")

def enforce_physical_constraints(labels, centers, min_cells=10):
    
    # Enforces the real-world build constraint: 
    # No zone can have fewer than 'min_cells' (physically unviable for a florist).
    # Merges orphaned cells into the closest dominant color zone.
    
    counts = Counter(labels)
    valid_clusters = [k for k, v in counts.items() if v >= min_cells]
    
    # If all clusters are physically viable, return as-is
    if len(valid_clusters) == len(centers):
        return labels, centers

    # Map invalid clusters to the nearest valid cluster based on color distance (Euclidean)
    mapping = {}
    for i in range(len(centers)):
        if i not in valid_clusters:
            # Find the closest valid cluster
            distances = [np.linalg.norm(centers[i] - centers[v]) for v in valid_clusters]
            closest_valid = valid_clusters[np.argmin(distances)]
            mapping[i] = closest_valid
        else:
            mapping[i] = i

    # Apply the mapping to enforce the constraint
    new_labels = np.array([mapping[label] for label in labels])
    return new_labels, centers

@app.post("/api/v1/cv/generate-matrix")
async def generate_matrix(
    file: UploadFile = File(...), 
    grid_resolution: int = Form(40),
    num_colors: int = Form(5)
):
    # 1. Read and decode the uploaded image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # 2. Downsample to the physical grid resolution (e.g., 40x40 cells for large bouquet)
    # This acts as our "pixelation" step for physical fabrication
    small_image = cv2.resize(image, (grid_resolution, grid_resolution), interpolation=cv2.INTER_LINEAR)
    
    # 3. Reshape for K-Means clustering
    pixels = small_image.reshape(-1, 3)
    
    # 4. Segment colors to identify flower zones
    kmeans = KMeans(n_clusters=num_colors, random_state=42, n_init=10)
    kmeans.fit(pixels)
    labels = kmeans.labels_
    centers = kmeans.cluster_centers_

    # 5. Apply physical build constraints (Research Novelty)
    constrained_labels, _ = enforce_physical_constraints(labels, centers, min_cells=10)

    # 6. Reconstruct the 2D grid matrix
    grid_matrix = constrained_labels.reshape(grid_resolution, grid_resolution).tolist()

    # Format the color zones for the frontend mapping
    zones = []
    for idx, color in enumerate(centers):
        hex_color = '#{:02x}{:02x}{:02x}'.format(int(color[0]), int(color[1]), int(color[2]))
        zones.append({
            "zone_id": idx,
            "hex_color": hex_color,
            "cell_count": int(np.sum(constrained_labels == idx))
        })

    return {
        "status": "success",
        "data": {
            "grid_resolution": grid_resolution,
            "grid": grid_matrix,
            "zones": [z for z in zones if z["cell_count"] > 0] # Only return viable zones
        }
    }