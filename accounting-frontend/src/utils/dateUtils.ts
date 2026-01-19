export const getNepaleseDate = (date: Date = new Date()) => {
  // Reference: Magh 1, 2082 = January 15, 2026 AD
  const bsYear = 2082;
  const adMonth = date.getMonth(); // 0 = Jan, 1 = Feb, etc.
  const adDay = date.getDate();
  
  let bsMonth = '';
  let bsDay = 0;

  if (adMonth === 0) { // January
    if (adDay < 15) {
      bsMonth = 'Poush';
      bsDay = adDay + 16; // Jan 1 = Poush 17
    } else {
      bsMonth = 'Magh';
      bsDay = adDay - 14; // Jan 15 = Magh 1, Jan 19 = Magh 5
    }
  } else if (adMonth === 1) { // February
    // Magh has 29 days in 2082
    if (adDay < 13) {
      bsMonth = 'Magh';
      bsDay = adDay + 17; // Feb 1 = Magh 18
    } else {
      bsMonth = 'Falgun';
      bsDay = adDay - 12; // Feb 13 = Falgun 1
    }
  } else {
    // Fallback for other months (approximate)
    bsMonth = 'Magh';
    bsDay = adDay;
  }
  
  return {
    bsDate: `${bsMonth} ${bsDay}, ${bsYear} BS`,
    adDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  };
};
