async function getMostDominantColor(image, transparency = 0.5) {
  let colors;
  try {
    colors = await getDominantColors(image, transparency);
  } catch (error) {
    console.log("error getting dominants colors. returning rgb(255, 255, 255)");
    return "rgb(255,255,255)";
  }
  if (colors.length === 0) {
    return "rgb(255,255,255)";
  }
  let color_to_return;
  if (
    colors[2] !== undefined &&
    colors[2] !== "rgb(255,255,255)" &&
    colors[2] !== "rgb(0,0,0)"
  ) {
    color_to_return = colors[2];
  } else if (
    colors[1] !== undefined &&
    colors[1] !== "rgb(255,255,255)" &&
    colors[1] !== "rgb(0,0,0)"
  ) {
    color_to_return = colors[1];
  } else {
    color_to_return = colors[0];
  }
  return color_to_return;
}

async function getDominantColors(imageUrl, transparency) {
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
      imageBitmap.height
    );
    const data = imageData.data;

    const colorCounts = {};
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a === 0) continue; // skip transparent pixels

      const colorKey = `${r},${g},${b},${transparency}`;
      if (colorCounts[colorKey]) {
        colorCounts[colorKey]++;
      } else {
        colorCounts[colorKey] = 1;
      }
    }

    const sortedColors = Object.entries(colorCounts).sort(
      (a, b) => b[1] - a[1]
    );
    const dominantColors = sortedColors
      .slice(0, 3)
      .map((entry) => `rgb(${entry[0]})`);
    return dominantColors;
  } catch (error) {
    console.error("Error fetching or processing the image:", error);
    throw new Error("Failed to process image.");
  }
}

self.onmessage = async (event) => {
  const { logo, transparency, id } = event.data;
  try {
    const color = await getMostDominantColor(logo, transparency);
    self.postMessage({ logo, color, idw: id });
  } catch (error) {
    self.postMessage({ error: error.message, logo: logo, idw: id });
  }
};
