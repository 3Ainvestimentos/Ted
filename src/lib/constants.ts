import type { NavItem, UserRole, Initiative } from '@/types';
import { LayoutDashboard, ShieldAlert, ScrollText, ClipboardList, Target, Briefcase, UserCircle2, LogOut, Settings, TrendingUp, TrendingDown, Minus, CircleCheck, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export const NAV_ITEMS_CONFIG: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Risk Assessment', href: '/risk-assessment', icon: ShieldAlert },
  { title: 'Executive Summaries', href: '/executive-summaries', icon: ScrollText },
  { title: 'Meeting Automation', href: '/meeting-automation', icon: ClipboardList },
  { title: 'Strategic Initiatives', href: '/initiatives', icon: Target },
];

export const USER_ROLES: UserRole[] = ['PMO', 'Leader', 'Contributor'];

export const STATUS_ICONS = {
  'On Track': CircleCheck,
  'At Risk': AlertTriangle,
  'Delayed': Clock,
  'Completed': CheckCircle,
};

export const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export const MOCK_INITIATIVES: Initiative[] = [
  {
    id: 'initiative-1',
    title: 'Digital Transformation Q4',
    status: 'On Track',
    owner: 'Alice Wonderland',
    description: 'Lead the company-wide adoption of new digital tools and processes.',
    lastUpdate: '2024-07-25',
    progress: 75,
    keyMetrics: [
      { name: 'Adoption Rate', value: '60%', trend: 'up' },
      { name: 'Training Completion', value: '85%', trend: 'neutral' },
    ],
  },
  {
    id: 'initiative-2',
    title: 'New Market Expansion',
    status: 'At Risk',
    owner: 'Bob The Builder',
    description: 'Explore and establish presence in three new international markets.',
    lastUpdate: '2024-07-22',
    progress: 30,
    keyMetrics: [
      { name: 'Leads Generated', value: '120', trend: 'down' },
      { name: 'Partnerships Signed', value: '2', trend: 'neutral' },
    ],
  },
  {
    id: 'initiative-3',
    title: 'Product Innovation X',
    status: 'Delayed',
    owner: 'Charlie Brown',
    description: 'Develop and launch the next-generation Product X.',
    lastUpdate: '2024-07-20',
    progress: 45,
    keyMetrics: [
      { name: 'R&D Milestones', value: '3/7', trend: 'neutral' },
      { name: 'Budget Variance', value: '+15%', trend: 'down' },
    ],
  },
  {
    id: 'initiative-4',
    title: 'Customer Success Enhancement',
    status: 'Completed',
    owner: 'Diana Prince',
    description: 'Improve customer satisfaction scores by 15% through new support initiatives.',
    lastUpdate: '2024-06-30',
    progress: 100,
    keyMetrics: [
      { name: 'CSAT Score', value: '92%', trend: 'up' },
      { name: 'Ticket Resolution Time', value: '4h', trend: 'up' },
    ],
  },
];
