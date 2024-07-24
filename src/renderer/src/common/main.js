export function convertMinuteToHoursMinute(minute) {
    return (
        ((minute - (minute % 60)) / 60 > 0
            ? ((minute - (minute % 60)) / 60).toFixed(0) + "h "
            : "") +
        (minute % 60 === 0
            ? ""
            : minute % 60 > 9
                ? (minute % 60).toFixed(0) + "m"
                : "0" + (minute % 60).toFixed(0) + "m")
    );
}

export function generateRandomColor() {
    // Generate random hue value between 0 and 360
    const hue = Math.floor(Math.random() * 360);

    // Set saturation to a value between 50% and 100%
    const saturation = Math.floor(Math.random() * 70) + 25;

    // Set lightness to a value between 40% and 60%
    const lightness = Math.floor(Math.random() * 10) + 65;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export async function getMostDominantColor(image, transparency = 0.5) {
    let colors;
    try{
        colors = await getDominantColors(image, transparency);
    }catch (error) {
        return "rgb(255,255,255)";
    }
    if(colors.length === 0){
        return "rgb(255,255,255)";
    }
    let color_to_return;
    if(colors[2] !== undefined && colors[2] !== "rgb(255,255,255)" && colors[2] !== "rgb(0,0,0)"){
        color_to_return = colors[2];
    }else if (colors[1] !== undefined && colors[1] !== "rgb(255,255,255)" && colors[1] !== "rgb(0,0,0)"){
        color_to_return = colors[1];
    }else {
        color_to_return = colors[0];
    }
    return color_to_return;
}

function getDominantColors(imageUrl, transparency) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // This helps to avoid CORS issues
        img.src = imageUrl;

        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            const imageData = ctx.getImageData(0, 0, img.width, img.height);
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

            const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
            const dominantColors = sortedColors.slice(0, 3).map(entry => `rgb(${entry[0]})`);
            resolve(dominantColors);
        };

        img.onerror = function () {
            reject(new Error('Failed to load image.'));
        };
    });
}
