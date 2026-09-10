export interface Guest {
  id: string;
  codigo_invitacion: string;
  nombre_principal: string;
  cupos_totales: number;
  confirmado: boolean;
  cupos_confirmados: number;
  asistira: boolean | null; // null = pending, true = joyfully accepts, false = regretfully declines
  asistentes_nombres?: string[];
  comentarios_dieta?: string;
  mensaje_novios?: string;
  fecha_confirmacion?: string;
  telefono?: string;
  email?: string;
  mesa_asignada?: string;
  categoria?: 'Familia Novia' | 'Familia Novio' | 'Amigos Novia' | 'Amigos Novio' | 'Universidad' | 'Trabajo' | 'Testigos' | 'General';
}

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  iconName: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  span?: string;
}

export interface AdminMetrics {
  totalInvitados: number;
  cuposTotales: number;
  confirmadosCount: number;
  cuposConfirmados: number;
  declinadosCount: number;
  pendientesCount: number;
  conAlergiasCount: number;
  porcentajeConfirmacion: number;
}
