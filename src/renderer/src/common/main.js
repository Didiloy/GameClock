export function convertMinuteToHoursMinute(minute) {
    return (
        ((minute - (minute % 60)) / 60 > 0
            ? (minute - (minute % 60)) / 60 + "h "
            : "") +
        (minute % 60 === 0
            ? ""
            : minute % 60 >= 10
                ? (minute % 60) + "m"
                : "0" + (minute % 60) + "m")
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
