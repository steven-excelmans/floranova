import type { Plant } from 'src/types/plant';
import type { Planting, PlantingTimelineEvent } from 'src/types/planting';

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function buildPlantingTimeline(
  planting: Planting,
  plant: Plant,
): PlantingTimelineEvent[] {
  const events: PlantingTimelineEvent[] = [];
  const seedDate = new Date(planting.dateSeeded);
  const now = new Date();

  // 1. Seeded event (always completed)
  events.push({
    id: `${planting.id}-seeded`,
    action: { nl: 'Gezaaid', en: 'Seeded' },
    expectedDate: seedDate,
    condition: {
      nl: `${planting.amount} zaden - ${planting.location}`,
      en: `${planting.amount} seeds - ${planting.location}`,
    },
    dateCalculable: true,
    completed: true,
  });

  // 2. Germination event
  if (plant.germinationDays) {
    const avgDays = Math.round((plant.germinationDays.min + plant.germinationDays.max) / 2);
    const germDate = addDays(seedDate, avgDays);
    events.push({
      id: `${planting.id}-germination`,
      action: { nl: 'Verwachte kieming', en: 'Expected germination' },
      expectedDate: germDate,
      condition: {
        nl: `${plant.germinationDays.min}-${plant.germinationDays.max} dagen`,
        en: `${plant.germinationDays.min}-${plant.germinationDays.max} days`,
      },
      dateCalculable: true,
      completed: now >= germDate || planting.completedMilestones.includes(`${planting.id}-germination`),
    });
  }

  // 3. Care steps from plant data
  for (const step of plant.careSteps) {
    const stepId = `${planting.id}-care-${step.order}`;

    if (step.condition.type === 'days') {
      const days = typeof step.condition.value === 'number' ? step.condition.value : 0;
      // Calculate from germination if available, otherwise from seed date
      const baseDate = plant.germinationDays
        ? addDays(seedDate, Math.round((plant.germinationDays.min + plant.germinationDays.max) / 2))
        : seedDate;
      const expectedDate = addDays(baseDate, days);
      events.push({
        id: stepId,
        action: step.action,
        expectedDate,
        condition: step.condition.description,
        dateCalculable: true,
        completed: now >= expectedDate || planting.completedMilestones.includes(stepId),
      });
    } else if (step.condition.type === 'date') {
      // Date-based conditions (e.g., "after ice saints" → ~May 15)
      // We approximate common date references
      events.push({
        id: stepId,
        action: step.action,
        expectedDate: null,
        condition: step.condition.description,
        dateCalculable: false,
        completed: planting.completedMilestones.includes(stepId),
      });
    } else {
      // height, leaves, temperature, custom → condition-based, manual completion
      events.push({
        id: stepId,
        action: step.action,
        expectedDate: null,
        condition: step.condition.description,
        dateCalculable: false,
        completed: planting.completedMilestones.includes(stepId),
      });
    }
  }

  return events;
}

export function getNextAction(
  timeline: PlantingTimelineEvent[],
): PlantingTimelineEvent | null {
  return timeline.find((e) => !e.completed) ?? null;
}
