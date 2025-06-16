export interface Initiative {
  id: string;
  title: string;
  status: 'On Track' | 'At Risk' | 'Delayed' | 'Completed';
  owner: string;
  description: string;
  lastUpdate: string;
  progress: number; // Percentage 0-100
  keyMetrics: { name: string; value: string; trend: 'up' | 'down' | 'neutral' }[];
}

export type UserRole = 'PMO' | 'Leader' | 'Contributor';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
}
