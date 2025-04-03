export function isHalloween() {
  const today = new Date();
  const before_halloween = new Date(today.getFullYear(), 9, 15); // October 15th
  const after_halloween = new Date(today.getFullYear(), 10, 3); // November 3rd
  return (
    today.getTime() > before_halloween.getTime() &&
    today.getTime() < after_halloween.getTime()
  );
}

export function isChristmas() {
  const today = new Date();
  const before_christmas = new Date(today.getFullYear(), 11, 15); // December 15th
  const after_christmas = new Date(today.getFullYear(), 11, 30); // December 30th
  return (
    today.getTime() > before_christmas.getTime() &&
    today.getTime() < after_christmas.getTime()
  );
}

export function isEaster() {
  const today = new Date();
  const before_easter = new Date(today.getFullYear(), 3, 1); // April 1st
  const after_easter = new Date(today.getFullYear(), 3, 25); // April 25th
  return (
    today.getTime() > before_easter.getTime() &&
    today.getTime() < after_easter.getTime()
  );
}
