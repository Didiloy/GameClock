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