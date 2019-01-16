// Add zero in front of numbers < 10
export function zeroPad(i) {
  
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

export function oneDecimal(f) {
    return(parseFloat(Math.round(f * 10) / 10).toFixed(1));
}

// From "PedanticAvenger" on Fitbit "nightscout" Dismiss channel :)
export function mmol( bg ) {
  let mmolBG = (bg / 18.0182);
  let rmmol = (Math.floor((mmolBG * 10) + 0.5)) / 10;
  return rmmol;
}

export function mgdl( bg ) {
    let BG = (bg * 18.0182);
    let mgdl = Math.floor(BG);
    return mgdl;
}

export function Min2ms(x) {
  return (x * 60 * 1000);
}

export function Hour2ms(x) {
  return (60 * Min2ms(x));
}

export function Day2ms(x) {
  return (24 * Hour2ms(x));
}
