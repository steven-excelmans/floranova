import type { MonthRange, Plant } from 'src/types/plant';

export type CalendarAction = 'indoorSowing' | 'coldGreenhouse' | 'outdoor';

export function isMonthInRange(month: number, range: MonthRange): boolean {
  if (!range) return false;
  return range.includes(month);
}

export function getPlantsForMonth(
  plants: Plant[],
  month: number,
  action: CalendarAction,
): Plant[] {
  return plants.filter((plant) => isMonthInRange(month, plant.calendar[action]));
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}
