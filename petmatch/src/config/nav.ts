import {
  Home,
  PawPrint,
  Search,
  MapPin,
  Heart,
  MessageCircle,
  Briefcase,
  Settings,
  Shield,
  Users,
  BarChart3,
  Flag,
  Building2,
  CalendarDays,
  AlertTriangle,
  Bell,
  Star,
  Stethoscope,
  DollarSign,
  Gift,
  Crown,
  ShoppingBag,
  HeartHandshake,
  SearchX,
  Video,
  Gamepad2,
} from "lucide-react";

export { Building2, Stethoscope, ShoppingBag as ShoppingBagIcon };

export type NavItem = {
  title: string;
  href: string;
  icon: typeof Home;
  children?: Omit<NavItem, "children">[];
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

export const ownerNav: NavGroup[] = [
  {
    items: [
      { title: "Inicio", href: "/dashboard", icon: Home },
      { title: "Marketplace", href: "/marketplace", icon: ShoppingBag },
      { title: "Mis Mascotas", href: "/dashboard/pets", icon: PawPrint },
    ],
  },
  {
    label: "Servicios",
    items: [
      {
        title: "Buscar Servicios", href: "/services", icon: Search,
        children: [
          { title: "Paseo", href: "/services?type=WALK", icon: PawPrint },
          { title: "Cuidado & Hospedaje", href: "/services?type=CARE", icon: Home },
          { title: "Grooming", href: "/services?type=GROOMING", icon: Stethoscope },
          { title: "Seguros", href: "/services?type=INSURANCE", icon: Shield },
        ],
      },
      {
        title: "Veterinarias", href: "/vets", icon: MapPin,
        children: [
          { title: "Clínicas", href: "/vets", icon: Building2 },
          { title: "Vet a domicilio", href: "/vets?tab=domicilio", icon: Stethoscope },
          { title: "Teleconsulta", href: "/vets?tab=teleconsulta", icon: Video },
        ],
      },
      { title: "Mis Reservas", href: "/dashboard/bookings", icon: CalendarDays },
    ],
  },
  {
    label: "Social",
    items: [
      { title: "PetMatch", href: "/match", icon: Heart },
      { title: "Adopción", href: "/adoption", icon: HeartHandshake },
      { title: "Mascotas perdidas", href: "/lost-pets", icon: SearchX },
      { title: "Mensajes", href: "/chat", icon: MessageCircle },
    ],
  },
  {
    label: "Mi cuenta",
    items: [
      { title: "Recordatorios", href: "/dashboard/reminders", icon: Bell },
      { title: "Favoritos", href: "/dashboard/favorites", icon: Star },
      { title: "Mis Seguros", href: "/dashboard/insurance", icon: Shield },
      { title: "Suscripcion", href: "/dashboard/subscription", icon: Crown },
      { title: "Mi Perfil", href: "/dashboard/profile", icon: Settings },
    ],
  },
  {
    label: "Juegos",
    items: [
      { title: "Perro Corredor", href: "/juego", icon: Gamepad2 },
    ],
  },
];

export const walkerNav: NavGroup[] = [
  {
    items: [
      { title: "Panel", href: "/provider", icon: Home },
      { title: "Mis Servicios", href: "/provider/services", icon: Briefcase },
      { title: "Reservas", href: "/provider/bookings", icon: CalendarDays },
      { title: "Ingresos", href: "/provider/earnings", icon: DollarSign },
    ],
  },
  {
    label: "Comunidad",
    items: [
      { title: "Marketplace", href: "/marketplace", icon: ShoppingBag },
      { title: "Mensajes", href: "/chat", icon: MessageCircle },
    ],
  },
  {
    items: [
      { title: "Mi Perfil", href: "/dashboard/profile", icon: Settings },
    ],
  },
];

export const vetNav: NavGroup[] = [
  {
    items: [
      { title: "Panel", href: "/provider", icon: Home },
      { title: "Mis Servicios", href: "/provider/services", icon: Briefcase },
      { title: "Reservas", href: "/provider/bookings", icon: CalendarDays },
      { title: "Ingresos", href: "/provider/earnings", icon: DollarSign },
    ],
  },
  {
    label: "Comunidad",
    items: [
      { title: "Marketplace", href: "/marketplace", icon: ShoppingBag },
      { title: "Mensajes", href: "/chat", icon: MessageCircle },
    ],
  },
  {
    items: [
      { title: "Mi Perfil", href: "/dashboard/profile", icon: Settings },
    ],
  },
];

export const clinicNav: NavGroup[] = [
  {
    items: [
      { title: "Panel", href: "/clinic", icon: Home },
      { title: "Perfil Clinica", href: "/clinic/profile", icon: Building2 },
      { title: "Mensajes", href: "/chat", icon: MessageCircle },
    ],
  },
];

export const insuranceProviderNav: NavGroup[] = [
  {
    items: [
      { title: "Mis Planes", href: "/provider/insurance", icon: Shield },
      { title: "Nuevo Plan", href: "/provider/insurance/new", icon: Gift },
    ],
  },
  {
    items: [
      { title: "Mensajes", href: "/chat", icon: MessageCircle },
      { title: "Mi Perfil", href: "/dashboard/profile", icon: Settings },
    ],
  },
];

export const adminNav: NavGroup[] = [
  {
    items: [
      { title: "Dashboard", href: "/admin", icon: BarChart3 },
      { title: "Usuarios", href: "/admin/users", icon: Users },
      { title: "Proveedores", href: "/admin/providers", icon: Shield },
      { title: "Reservas", href: "/admin/bookings", icon: CalendarDays },
    ],
  },
  {
    label: "Moderacion",
    items: [
      { title: "Incidentes", href: "/admin/incidents", icon: AlertTriangle },
      { title: "Reportes", href: "/admin/reports", icon: Flag },
      { title: "Adopciones", href: "/admin/adoptions", icon: HeartHandshake },
      { title: "Marketplace", href: "/admin/marketplace", icon: ShoppingBag },
      { title: "Seguros", href: "/admin/insurance", icon: Shield },
      { title: "Veterinarias", href: "/admin/clinics", icon: Building2 },
    ],
  },
];

// Flat nav items for mobile bottom bar (max 5 items)
export const ownerMobileNav: NavItem[] = [
  { title: "Inicio", href: "/dashboard", icon: Home },
  { title: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { title: "Servicios", href: "/services", icon: Search },
  { title: "Mensajes", href: "/chat", icon: MessageCircle },
  { title: "Mascotas", href: "/dashboard/pets", icon: PawPrint },
];

export const walkerMobileNav: NavItem[] = [
  { title: "Panel", href: "/provider", icon: Home },
  { title: "Servicios", href: "/provider/services", icon: Briefcase },
  { title: "Reservas", href: "/provider/bookings", icon: CalendarDays },
  { title: "Mensajes", href: "/chat", icon: MessageCircle },
  { title: "Perfil", href: "/dashboard/profile", icon: Settings },
];

export const vetMobileNav: NavItem[] = [
  { title: "Panel", href: "/provider", icon: Home },
  { title: "Servicios", href: "/provider/services", icon: Briefcase },
  { title: "Reservas", href: "/provider/bookings", icon: CalendarDays },
  { title: "Mensajes", href: "/chat", icon: MessageCircle },
  { title: "Perfil", href: "/dashboard/profile", icon: Settings },
];

export const adminMobileNav: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: BarChart3 },
  { title: "Usuarios", href: "/admin/users", icon: Users },
  { title: "Proveedores", href: "/admin/providers", icon: Shield },
  { title: "Incidentes", href: "/admin/incidents", icon: AlertTriangle },
];
