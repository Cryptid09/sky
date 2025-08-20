import cv2
from skimage.metrics import structural_similarity as ssim

def compare_images(image1_path, image2_path):
    # Read images
    img1 = cv2.imread(image1_path)
    img2 = cv2.imread(image2_path)

    # Resize to same dimensions
    img1 = cv2.resize(img1, (500, 500))
    img2 = cv2.resize(img2, (500, 500))

    # Convert to grayscale
    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

    # Compute SSIM
    score, diff = ssim(gray1, gray2, full=True)
    print(f"SSIM Score: {score}")

    # Show result
    if score == 1.0:
        print("✅ Images are identical")
    elif score > 0.8:
        print("🔍 Images are very similar")
    else:
        print("❌ Images are different")

    # Optional: Show difference
    diff = (diff * 255).astype("uint8")
    cv2.imshow("Difference", diff)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

if __name__ == "__main__":
    compare_images("image1.jpg", "image2.jpg")
