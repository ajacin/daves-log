import {
  faHouse,
  faListCheck,
  faShoppingCart,
  faBaby,
  faEllipsis,
  faChartLine,
  faCog,
  faUsers,
  faClipboardList,
  faPlus
} from '@fortawesome/free-solid-svg-icons'

export const bottomNavItems = [
  {
    id: 'home',
    label: 'Home',
    to: '/dashboard',
    icon: faHouse,
    match: (pathname) => pathname === '/dashboard' || pathname === '/dashboard/'
  },
  {
    id: 'tasks',
    label: 'Tasks',
    to: '/dashboard/ideas',
    icon: faListCheck,
    match: (pathname) => pathname.startsWith('/dashboard/ideas')
  },
  {
    id: 'shopping',
    label: 'Shop',
    to: '/dashboard/shopping',
    icon: faShoppingCart,
    match: (pathname) => pathname.startsWith('/dashboard/shopping')
  },
  {
    id: 'quick-add',
    label: 'Add',
    action: 'quick-add',
    icon: faPlus,
    match: () => false
  },
  {
    id: 'more',
    label: 'More',
    to: '/dashboard/more',
    icon: faEllipsis,
    match: (pathname) =>
      pathname.startsWith('/dashboard/more') ||
      pathname.startsWith('/dashboard/activities') ||
      pathname.startsWith('/dashboard/view-activities') ||
      pathname.startsWith('/dashboard/automations') ||
      pathname.startsWith('/dashboard/invitees') ||
      pathname.startsWith('/dashboard/activity-log')
  }
]

export const dashboardSections = [
  {
    id: 'tasks',
    title: 'Tasks',
    description: 'Plan, track, and complete your to-dos',
    to: '/dashboard/ideas',
    icon: faListCheck,
    accent: 'text-blue-600 bg-blue-50'
  },
  {
    id: 'shopping',
    title: 'Shopping',
    description: 'Groceries and errands by store',
    to: '/dashboard/shopping',
    icon: faShoppingCart,
    accent: 'text-emerald-600 bg-emerald-50'
  },
  {
    id: 'log-activities',
    title: 'Log Activities',
    description: 'Record feeds, diapers, and more',
    to: '/dashboard/activities',
    icon: faBaby,
    accent: 'text-violet-600 bg-violet-50'
  },
  {
    id: 'view-activities',
    title: 'View Activities',
    description: 'Review activity history and trends',
    to: '/dashboard/view-activities',
    icon: faChartLine,
    accent: 'text-amber-600 bg-amber-50'
  }
]

export const dashboardSecondaryLinks = [
  {
    id: 'log-activities',
    title: 'Log Activities',
    description: 'Record feeds, diapers, and more',
    to: '/dashboard/activities',
    icon: faBaby
  },
  {
    id: 'automations',
    title: 'Automations',
    description: 'Smart home routines',
    to: '/dashboard/automations',
    icon: faCog
  },
  {
    id: 'invitees',
    title: 'Invitees',
    description: 'Manage household access',
    to: '/dashboard/invitees',
    icon: faUsers
  },
  {
    id: 'activity-log',
    title: 'Activity Log',
    description: 'App activity audit trail',
    to: '/dashboard/activity-log',
    icon: faClipboardList
  }
]
