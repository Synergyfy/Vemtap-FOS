export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
}

export interface Project {
  id: string;
  name: string;
  budget: number;
  spent: number;
  revenue: number;
  status: string;
  deadline: string;
}

export interface GoalsData {
  goals: Goal[];
  projects: Project[];
}
