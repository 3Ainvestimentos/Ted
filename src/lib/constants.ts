
import type { NavItem, UserRole, Initiative, InitiativeStatus, InitiativePriority, RecurringMeeting } from '@/types';
import { LayoutDashboard, Target, CalendarClock, Settings, Shield, User, BarChart3, ListTodo, CircleCheck, AlertTriangle, Clock, CheckCircle, TrendingUp, TrendingDown, Minus, Lightbulb, FileText, Bug } from 'lucide-react';

export const NAV_ITEMS_CONFIG: NavItem[] = [
  { title: 'Painel Estratégico', href: '/strategic-panel', icon: LayoutDashboard },
  { title: 'Iniciativas Estratégicas', href: '/strategic-initiatives', icon: Target },
  { title: 'Agenda de Reuniões', href: '/meeting-agenda', icon: CalendarClock },
];


export const USER_ROLES: UserRole[] = ['PMO', 'Líder', 'Colaborador'];

export const STATUS_ICONS: Record<InitiativeStatus, React.ElementType> = {
  'A Fazer': ListTodo,
  'Em Dia': CircleCheck,
  'Em Risco': AlertTriangle,
  'Atrasado': Clock,
  'Concluído': CheckCircle,
};

export const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export const KANBAN_COLUMNS_ORDER: InitiativeStatus[] = ['A Fazer', 'Em Dia', 'Atrasado', 'Em Risco', 'Concluído'];


export const MOCK_INITIATIVES: Initiative[] = [];

export const MOCK_RECURRING_MEETINGS: RecurringMeeting[] = [];

// Mock data for collaborators
export const initialCollaborators: { id: number; name: string; email: string; area: string; cargo: string; }[] = [];

// Mock data for permissions
export const initialPermissions = initialCollaborators.reduce((acc, user) => {
  const navItemsForPermissions = NAV_ITEMS_CONFIG.filter(item => !item.isDivider);
  acc[user.id] = navItemsForPermissions.reduce((userPermissions, navItem) => {
    userPermissions[navItem.href] = true; // All enabled by default
    return userPermissions;
  }, {} as Record<string, boolean>);
  return acc;
}, {} as Record<number, Record<string, boolean>>);
