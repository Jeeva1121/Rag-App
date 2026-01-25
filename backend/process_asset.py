from PIL import Image
import numpy as np
import os

def remove_background(input_path, output_path):
    # Open the image
    img = Image.open(input_path).convert("RGBA")
    
    # Convert to numpy array
    data = np.array(img)
    
    # White background removal (simple thresholding)
    # Background in a "white background" render is typically very close to [255, 255, 255]
    # We'll target pixels where R, G, B are all > 240
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    mask = (r > 240) & (g > 240) & (b > 240)
    
    # Set those pixels to transparent
    data[:,:,3][mask] = 0
    
    # Create new image from modified data
    new_img = Image.fromarray(data)
    
    # Crop to content to remove extra spacing
    bbox = new_img.getbbox()
    if bbox:
        new_img = new_img.crop(bbox)
        
    new_img.save(output_path, "PNG")
    print(f"Processed {input_path} -> {output_path}")

if __name__ == "__main__":
    # Get the latest generated image
    input_file = "C:/Users/jeeva/.gemini/antigravity/brain/591ea8bb-ee77-4f35-8cff-749d99470ced/ai_chatbot_3d_asset_1769350085066.png"
    output_dir = "c:/Users/jeeva/OneDrive/Desktop/New folder (2)/frontend/public"
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "chatbot-asset.png")
    
    remove_background(input_file, output_file)
