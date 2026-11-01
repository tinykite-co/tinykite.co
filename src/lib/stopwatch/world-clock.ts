/**
 * World Clock Engine & Timezone Utilities.
 *
 * Provides accurate city readings using Intl.DateTimeFormat, computes solar phases
 * (dawn/day/dusk/night), calculates local hour offsets, and determines relative day
 * labels (Today/Tomorrow/Yesterday).
 * Strict TypeScript compliant with astro/tsconfigs/strictest.
 */

import { MS_PER_HOUR, type WorldCityConfig } from './config.ts';

export type SolarPhase = 'day' | 'night' | 'dawn' | 'dusk';

export interface WorldClockReading {
  readonly cityId: string;
  readonly cityName: string;
  readonly country: string;
  readonly timeZone: string;
  readonly formattedTime: string;
  readonly period: string;
  readonly formattedDate: string;
  readonly relativeDayLabel: 'Today' | 'Tomorrow' | 'Yesterday';
  readonly offsetHoursLabel: string;
  readonly solarPhase: SolarPhase;
  readonly hour24: number;
  readonly minute: number;
  readonly second: number;
}

/**
 * Classifies an hour (0..23) into a solar phase:
 * - 5..6: dawn
 * - 7..17: day
 * - 18..19: dusk
 * - otherwise: night
 */
export function classifySolarPhase(hour24: number): SolarPhase {
  const h = Math.max(0, Math.min(23, Math.floor(hour24)));
  if (h >= 5 && h <= 6) {
    return 'dawn';
  }
  if (h >= 7 && h <= 17) {
    return 'day';
  }
  if (h >= 18 && h <= 19) {
    return 'dusk';
  }
  return 'night';
}

interface DateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function extractDateParts(timeZone: string, date: Date): DateParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  let year = 1970;
  let month = 1;
  let day = 1;
  let hour = 0;
  let minute = 0;
  let second = 0;

  for (const part of parts) {
    if (part.type === 'year') year = parseInt(part.value, 10);
    else if (part.type === 'month') month = parseInt(part.value, 10);
    else if (part.type === 'day') day = parseInt(part.value, 10);
    else if (part.type === 'hour') hour = parseInt(part.value, 10) % 24;
    else if (part.type === 'minute') minute = parseInt(part.value, 10);
    else if (part.type === 'second') second = parseInt(part.value, 10);
  }

  return { year, month, day, hour, minute, second };
}

/**
 * Computes the exact timezone offset from UTC in milliseconds for a timezone at a given date.
 */
export function getTimeZoneOffsetMs(timeZone: string, date: Date): number {
  const parts = extractDateParts(timeZone, date);
  const targetUtcMs = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  return targetUtcMs - date.getTime();
}

/**
 * Computes a comprehensive WorldClockReading for a specific city relative to
 * the viewer's local timezone.
 */
export function getWorldClockReading(
  city: WorldCityConfig,
  now: Date = new Date(),
  localTimeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
  use24Hour: boolean = false
): WorldClockReading {
  const cityParts = extractDateParts(city.timeZone, now);
  const localParts = extractDateParts(localTimeZone, now);

  // 1. Determine Relative Day (Today / Tomorrow / Yesterday)
  const cityDayVal = cityParts.year * 10000 + cityParts.month * 100 + cityParts.day;
  const localDayVal = localParts.year * 10000 + localParts.month * 100 + localParts.day;

  let relativeDayLabel: 'Today' | 'Tomorrow' | 'Yesterday' = 'Today';
  if (cityDayVal > localDayVal) {
    relativeDayLabel = 'Tomorrow';
  } else if (cityDayVal < localDayVal) {
    relativeDayLabel = 'Yesterday';
  }

  // 2. Determine Hour Offset vs Local
  const cityOffsetMs = getTimeZoneOffsetMs(city.timeZone, now);
  const localOffsetMs = getTimeZoneOffsetMs(localTimeZone, now);
  const diffMs = cityOffsetMs - localOffsetMs;
  const diffHours = diffMs / MS_PER_HOUR;

  let offsetHoursLabel = 'LOCAL';
  if (diffHours > 0) {
    const formattedHours = Number.isInteger(diffHours) ? String(diffHours) : diffHours.toFixed(1);
    offsetHoursLabel = `+${formattedHours} HRS`;
  } else if (diffHours < 0) {
    const absHours = Math.abs(diffHours);
    const formattedHours = Number.isInteger(absHours) ? String(absHours) : absHours.toFixed(1);
    offsetHoursLabel = `-${formattedHours} HRS`;
  }

  // 3. Format Time & Period
  const minutePadded = String(cityParts.minute).padStart(2, '0');
  let formattedTime: string;
  let period: string;

  if (use24Hour) {
    formattedTime = `${String(cityParts.hour).padStart(2, '0')}:${minutePadded}`;
    period = '';
  } else {
    period = cityParts.hour >= 12 ? 'PM' : 'AM';
    const hour12 = cityParts.hour % 12 === 0 ? 12 : cityParts.hour % 12;
    formattedTime = `${String(hour12).padStart(2, '0')}:${minutePadded}`;
  }

  // 4. Formatted Date
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: city.timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedDate = dateFormatter.format(now);

  // 5. Solar Phase
  const solarPhase = classifySolarPhase(cityParts.hour);

  return {
    cityId: city.id,
    cityName: city.name,
    country: city.country,
    timeZone: city.timeZone,
    formattedTime,
    period,
    formattedDate,
    relativeDayLabel,
    offsetHoursLabel,
    solarPhase,
    hour24: cityParts.hour,
    minute: cityParts.minute,
    second: cityParts.second,
  };
}
