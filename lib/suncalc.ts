// This is a simplified version of the SunCalc library for our needs
// Original: https://github.com/mourner/suncalc

const PI = Math.PI,
  rad = PI / 180,
  dayMs = 1000 * 60 * 60 * 24,
  J1970 = 2440588,
  J2000 = 2451545;

function toJulian(date: Date) {
  return date.valueOf() / dayMs - 0.5 + J1970;
}
function fromJulian(j: number) {
  return new Date((j + 0.5 - J1970) * dayMs);
}
function toDays(date: Date) {
  return toJulian(date) - J2000;
}

function rightAscension(l: number, b: number) {
  return Math.atan2(Math.sin(l) * Math.cos(rad * 23.4), Math.cos(l));
}
function declination(l: number, b: number) {
  return Math.asin(
    Math.sin(b) * Math.cos(rad * 23.4) +
      Math.cos(b) * Math.sin(rad * 23.4) * Math.sin(l)
  );
}
function azimuth(H: number, phi: number, dec: number) {
  return Math.atan2(
    Math.sin(H),
    Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)
  );
}
function altitude(H: number, phi: number, dec: number) {
  return Math.asin(
    Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H)
  );
}
function siderealTime(d: number, lw: number) {
  return rad * (280.16 + 360.9856235 * d) - lw;
}
function astroRefraction(h: number) {
  if (h < 0) h = 0;
  return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
}

function solarMeanAnomaly(d: number) {
  return rad * (357.5291 + 0.98560028 * d);
}
function eclipticLongitude(M: number) {
  const C =
      rad *
      (1.9148 * Math.sin(M) +
        0.02 * Math.sin(2 * M) +
        0.0003 * Math.sin(3 * M)),
    P = rad * 102.9372;
  return M + C + P + PI;
}
function sunCoords(d: number) {
  const M = solarMeanAnomaly(d),
    L = eclipticLongitude(M);
  return {
    dec: declination(L, 0),
    ra: rightAscension(L, 0),
  };
}

const SunCalc = {
  getTimes: (date: Date, lat: number, lng: number) => {
    const lw = rad * -lng,
      phi = rad * lat,
      d = toDays(date),
      n = Math.round(d - 0.0009) - 0.5,
      ds = Math.round(d - 0.0009) + 0.5,
      M = solarMeanAnomaly(n),
      L = eclipticLongitude(M),
      dec = declination(L, 0),
      Jnoon = J2000 + n + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);

    function getSetJ(h: number) {
      const w = hourAngle(h, phi, dec),
        a = approxTransit(w, lw, n);
      return solarTransitJ(a, lw, M);
    }

    function hourAngle(h: number, phi: number, d: number) {
      return Math.acos(
        (Math.sin(h) - Math.sin(phi) * Math.sin(d)) /
          (Math.cos(phi) * Math.cos(d))
      );
    }

    function approxTransit(Ht: number, lw: number, n: number) {
      return J2000 + n + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
    }

    function solarTransitJ(approx: number, lw: number, M: number) {
      return approx + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
    }

    const h0 = rad * -0.833,
      h1 = rad * -6,
      h2 = rad * -12,
      h3 = rad * -18;

    return {
      sunrise: fromJulian(getSetJ(h0 - astroRefraction(h0))),
      sunset: fromJulian(getSetJ(-h0 - astroRefraction(h0))),
    };
  },
};

export default SunCalc;
