from PIL import Image

# Path to your original logo
input_path = "public/m4capitallogo2.png"
# Path for the resized output
output_path = "public/m4capitallogo2_1024.png"

# Open the image
img = Image.open(input_path)
# Resize to 1024x1024 (keep aspect ratio, pad if needed)
img = img.convert("RGBA")
size = (1024, 1024)

# Create a white background
background = Image.new("RGBA", size, (255, 255, 255, 0))
# Resize logo to fit within 1024x1024, keeping aspect ratio
img.thumbnail(size, Image.LANCZOS)
# Center the logo
x = (size[0] - img.width) // 2
y = (size[1] - img.height) // 2
background.paste(img, (x, y), img)
# Save as PNG
background.save(output_path)
print(f"Resized logo saved to {output_path}")
