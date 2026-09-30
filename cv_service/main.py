import io
import random
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO

app = FastAPI(title="Floria CV Microservice", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize YOLO model globally on startup
model = YOLO('yolov8n.pt')

@app.post("/api/v1/cv/generate-matrix")
async def generate_matrix(file: UploadFile = File(...)):
    # Read the image bytes
    contents = await file.read()
    
    # Use Pillow to read and convert to RGB
    image = Image.open(io.BytesIO(contents))
    image = image.convert("RGB")
    
    # Convert PIL Image to NumPy array (RGB format)
    image_array = np.array(image)
    
    # Pass the array to the YOLO model for inference
    results = model(image_array)
    
    # Initialize an empty 8x12 grid with zeros
    grid_rows = 8
    grid_cols = 12
    gridMatrix = [[0 for _ in range(grid_cols)] for _ in range(grid_rows)]
    
    # Dimensions of the image for spatial mapping
    height, width, _ = image_array.shape
    
    # Cell dimensions in pixels
    cell_width = width / grid_cols
    cell_height = height / grid_rows
    
    # Iterate through detected bounding boxes
    for box in results[0].boxes:
        # Get x and y center of the detected object
        xywh = box.xywh[0].cpu().numpy()
        x_center, y_center = xywh[0], xywh[1]
        
        # Map the center point to the closest cell in our 8x12 gridMatrix
        col = int(x_center // cell_width)
        row = int(y_center // cell_height)
        
        # Ensure the calculated indices are within bounds
        if 0 <= col < grid_cols and 0 <= row < grid_rows:
            # Assign a random zone (1-4) to populated cells
            gridMatrix[row][col] = random.randint(1, 4)
            
    zones = [
        { "zone_id": 1, "name": "Conservatory & Palms", "hex_color": "#5B6C43" },
        { "zone_id": 2, "name": "Medicinal Herbarium", "hex_color": "#A68B5B" },
        { "zone_id": 3, "name": "Orchid Terrarium", "hex_color": "#8A9A65" },
        { "zone_id": 4, "name": "Arboretum Nursery", "hex_color": "#435334" },
        { "zone_id": 5, "name": "Central Fountain Courtyard", "hex_color": "#7F9370" },
        { "zone_id": 6, "name": "Perennial Borders", "hex_color": "#C2A676" },
        { "zone_id": 7, "name": "Alpine Rock Garden", "hex_color": "#657754" },
        { "zone_id": 8, "name": "Fern & Moss Ravine", "hex_color": "#3B492B" },
    ]

    return {
        "gridMatrix": gridMatrix,
        "zones": zones
    }