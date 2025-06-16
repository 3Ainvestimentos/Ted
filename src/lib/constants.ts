import type { NavItem, UserRole, Initiative } from '@/types';
import { LayoutDashboard, ShieldAlert, ScrollText, ClipboardList, Target, Briefcase, UserCircle2, LogOut, Settings, TrendingUp, TrendingDown, Minus, CircleCheck, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export const NAV_ITEMS_CONFIG: NavItem[] = [
  { title: 'Painel', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Análise de Risco', href: '/risk-assessment', icon: ShieldAlert },
  { title: 'Sumários Executivos', href: '/executive-summaries', icon: ScrollText },
  { title: 'Automação de Reuniões', href: '/meeting-automation', icon: ClipboardList },
  { title: 'Iniciativas Estratégicas', href: '/initiatives', icon: Target },
];

export const USER_ROLES: UserRole[] = ['PMO', 'Líder', 'Colaborador'];

export const STATUS_ICONS = {
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

export const MOCK_INITIATIVES: Initiative[] = [
  {
    id: 'initiative-1',
    title: 'Transformação Digital T4',
    status: 'Em Dia',
    owner: 'Alice Wonderland',
    description: 'Liderar a adoção de novas ferramentas e processos digitais em toda a empresa.',
    lastUpdate: '2024-07-25',
    progress: 75,
    keyMetrics: [
      { name: 'Taxa de Adoção', value: '60%', trend: 'up' },
      { name: 'Conclusão de Treinamento', value: '85%', trend: 'neutral' },
    ],
  },
  {
    id: 'initiative-2',
    title: 'Expansão para Novos Mercados',
    status: 'Em Risco',
    owner: 'Bob The Builder',
    description: 'Explorar e estabelecer presença em três novos mercados internacionais.',
    lastUpdate: '2024-07-22',
    progress: 30,
    keyMetrics: [
      { name: 'Leads Gerados', value: '120', trend: 'down' },
      { name: 'Parcerias Assinadas', value: '2', trend: 'neutral' },
    ],
  },
  {
    id: 'initiative-3',
    title: 'Inovação de Produto X',
    status: 'Atrasado',
    owner: 'Charlie Brown',
    description: 'Desenvolver e lançar a próxima geração do Produto X.',
    lastUpdate: '2024-07-20',
    progress: 45,
    keyMetrics: [
      { name: 'Marcos de P&D', value: '3/7', trend: 'neutral' },
      { name: 'Variação Orçamentária', value: '+15%', trend: 'down' },
    ],
  },
  {
    id: 'initiative-4',
    title: 'Melhoria do Sucesso do Cliente',
    status: 'Concluído',
    owner: 'Diana Prince',
    description: 'Melhorar os índices de satisfação do cliente em 15% através de novas iniciativas de suporte.',
    lastUpdate: '2024-06-30',
    progress: 100,
    keyMetrics: [
      { name: 'Índice CSAT', value: '92%', trend: 'up' },
      { name: 'Tempo de Resolução de Tickets', value: '4h', trend: 'up' },
    ],
  },
];
