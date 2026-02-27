import type { BilingualText } from './plant';

export type PlantingLocation = 'indoor' | 'greenhouse' | 'cold-greenhouse' | 'outdoor';

export interface Planting {
  id: string;
  plantId: string;
  dateSeeded: string; // ISO date YYYY-MM-DD
  amount: number;
  location: PlantingLocation;
  notes: string;
  completedMilestones: string[];
  createdAt: string;
}

export interface PlantingTimelineEvent {
  id: string;
  action: BilingualText;
  expectedDate: Date | null;
  condition: BilingualText;
  dateCalculable: boolean;
  completed: boolean;
}
