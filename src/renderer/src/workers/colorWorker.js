import quantize from "quantize";

async function getMostDominantColor(image) {
  let colors;
  try {
    colors = await getDominantColors(image);
  } catch (error) {
    console.log("error getting dominants colors. returning rgb(255, 255, 255)");
    return "rgb(255,255,255)";
  }

  if (colors === null) {
    return "rgb(255,255,255)";
  } else {
    return colors[1];
  }
}

function createPixelArray(pixels, pixelCount, quality) {
  const pixelArray = [];

  for (let i = 0, offset, r, g, b, a; i < pixelCount; i += quality) {
    offset = i * 4;
    r = pixels[offset];
    g = pixels[offset + 1];
    b = pixels[offset + 2];
    a = pixels[offset + 3];

    // If pixel is mostly opaque and not white
    if (
      (typeof a === "undefined" || a >= 125) &&
      !(r > 250 && g > 250 && b > 250)
    )
      pixelArray.push([r, g, b]);
  }

  return pixelArray;
}

async function getDominantColors(imageUrl) {
  try {
    // Fetch the image as a Blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Create an ImageBitmap from the Blob
    const imageBitmap = await createImageBitmap(blob);

    // Create an OffscreenCanvas to draw the ImageBitmap
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageBitmap, 0, 0, imageBitmap.width, imageBitmap.height);

    // Get image data from the OffscreenCanvas
    const imageData = ctx.getImageData(
      0,
      0,
      imageBitmap.width,
      imageBitmap.height,
    );
    const data = imageData.data;
    const pixelCount = imageData.width * imageData.height;
    const pixelArray = createPixelArray(data, pixelCount, 10);
    const colormap = quantize(pixelArray, 3);
    const palette = colormap ? colormap.palette() : null;
    return palette !== null
      ? [
          `rgb(${palette[0][0]}, ${palette[0][1]}, ${palette[0][2]})`,
          `rgba(${palette[1][0]}, ${palette[1][1]}, ${palette[1][2]}, 0.6)`,
        ]
      : null;
  } catch (error) {
    console.log("Error fetching or processing the image:", error);
    throw new Error("Failed to process image.");
  }
}

self.onmessage = async (event) => {
  const { logo, id } = event.data;
  try {
    const color = await getMostDominantColor(logo);
    self.postMessage({ logo, color, idw: id });
  } catch (error) {
    self.postMessage({ error: error.message, logo: logo, idw: id });
  }
};
