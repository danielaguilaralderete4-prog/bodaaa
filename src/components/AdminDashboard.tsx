import React, { useState } from 'react';
import { useGuests } from '../context/GuestContext';
import { Guest } from '../types';
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  UserPlus,
  Search,
  Filter,
  X,
  Edit2,
  Trash2,
  RotateCcw,
  Mail,
  Send,
  Eye,
  Sparkles,
  Phone,
  Layers,
  ArrowUpDown,
  Utensils,
  Check,
  Copy,
  Share2,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const {
    guests,
    metrics,
    addGuest,
    updateGuest,
    deleteGuest,
    resetRSVP,
    resetAllToDefault,
    exportGuestListCSV,
  } = useGuests();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'confirmed' | 'pending' | 'declined' | 'allergies'
  >('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [simulatedEmailGuest, setSimulatedEmailGuest] = useState<Guest | null>(null);
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);

  const getGuestInvitationUrl = (guest: Guest) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?invitado=${encodeURIComponent(guest.nombre_principal)}#rsvp`;
  };

  const handleCopyLink = (guest: Guest) => {
    const url = getGuestInvitationUrl(guest);
    navigator.clipboard.writeText(url);
    setCopiedGuestId(guest.id);
    setTimeout(() => setCopiedGuestId(null), 2500);
  };

  const handleShareWhatsApp = (guest: Guest) => {
    const url = getGuestInvitationUrl(guest);
    const text = `¡Hola ${guest.nombre_principal}! ✨ Con mucha alegría y cariño, Daniel y Bárbara queremos invitarte a nuestro Matrimonio el 12 de Diciembre de 2026. Hemos reservado ${guest.cupos_totales} ${guest.cupos_totales === 1 ? 'cupo personal' : 'cupos'} para ti / tu familia. Puedes ver todos los detalles y confirmar tu asistencia en este enlace: ${url}`;
    const whatsappUrl = guest.telefono
      ? `https://wa.me/${guest.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  // New Guest Form state
  const [newName, setNewName] = useState('');
  const [newSpots, setNewSpots] = useState(2);
  const [newCategory, setNewCategory] = useState<Guest['categoria']>('Familia Novio');
  const [newPhone, setNewPhone] = useState('');
  const [newTable, setNewTable] = useState('Por asignar');
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered guest list
  const filteredGuests = guests.filter((g) => {
    // Search query
    const matchesSearch =
      searchQuery === '' ||
      g.nombre_principal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.asistentes_nombres &&
        g.asistentes_nombres.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase())));

    // Status filter
    let matchesStatus = true;
    if (filterStatus === 'confirmed') matchesStatus = g.confirmado && g.asistira === true;
    if (filterStatus === 'pending') matchesStatus = !g.confirmado;
    if (filterStatus === 'declined') matchesStatus = g.confirmado && g.asistira === false;
    if (filterStatus === 'allergies')
      matchesStatus =
        Boolean(g.comentarios_dieta && g.comentarios_dieta.trim().length > 0) && g.asistira === true;

    // Category filter
    let matchesCat = true;
    if (filterCategory !== 'all') matchesCat = g.categoria === filterCategory;

    return matchesSearch && matchesStatus && matchesCat;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFormError('El nombre o familia del invitado es requerido.');
      return;
    }

    // Auto-generate internal unique code
    const autoCode = `INV-${Date.now().toString(36).toUpperCase()}`;

    const res = addGuest({
      codigo_invitacion: autoCode,
      nombre_principal: newName.trim(),
      cupos_totales: Number(newSpots),
      confirmado: false,
      cupos_confirmados: 0,
      asistira: null,
      asistentes_nombres: [],
      comentarios_dieta: '',
      telefono: newPhone.trim(),
      categoria: newCategory,
      mesa_asignada: newTable.trim(),
    });

    if (res.success) {
      setIsAddModalOpen(false);
      setNewName('');
      setNewSpots(2);
      setNewPhone('');
      setFormError(null);
    } else {
      setFormError(res.message);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;

    updateGuest(editingGuest.id, {
      nombre_principal: editingGuest.nombre_principal,
      cupos_totales: Number(editingGuest.cupos_totales),
      categoria: editingGuest.categoria,
      telefono: editingGuest.telefono,
      mesa_asignada: editingGuest.mesa_asignada,
      comentarios_dieta: editingGuest.comentarios_dieta,
    });

    setEditingGuest(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FDFCF0] overflow-y-auto pb-20">
      {/* Top sticky bar */}
      <div className="sticky top-0 z-40 bg-[#FDFCF0]/95 backdrop-blur-md border-b border-[#E0D8C3] px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center font-serif-display font-bold">
            B&D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-display text-lg sm:text-xl font-bold text-[#333333]">
                Panel de Gestión de Invitados
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Firebase Conectado
              </span>
            </div>
            <p className="text-xs text-[#6B6B56]">
              Control de Asistencia en Tiempo Real &bull; Bárbara & Daniel 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportGuestListCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#5A5A40] text-[#5A5A40] hover:bg-[#EAE7DC] text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5A5A40] text-white hover:bg-[#474732] text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Agregar Invitado</span>
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#EAE7DC] hover:bg-[#E0D8C3] flex items-center justify-center text-[#5A5A40] transition-colors"
            title="Volver a la invitación"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Anti-+1 Security Banner / Instruction Guide */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#EAE7DC] border-2 border-[#BC986A]/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-[#EAE7DC]" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-base sm:text-lg text-[#333333]">
                Control Estricto de Cupos (Sin Códigos - Solo por Nombre / Link)
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6B56] leading-relaxed mt-0.5 max-w-3xl">
                Cada invitado tiene configurado su número exacto de <strong>Cupos Asignados</strong>. Al ingresar buscando su nombre o haciendo clic en el link de WhatsApp, el sistema <strong>bloquea la confirmación al número máximo de pases asignados</strong>, impidiendo acompañantes no autorizados. ¡Sin necesidad de recordar ningún código!
              </p>
            </div>
          </div>
        </div>

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Guests Card */}
          <div className="bg-[#F7F3E9] p-5 rounded-2xl border border-[#E0D8C3] shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-[#6B6B56] mb-1">
                  Total Invitaciones
                </p>
                <p className="font-serif-display text-3xl sm:text-4xl font-bold text-[#5A5A40]">
                  {metrics.totalInvitados}
                </p>
                <p className="text-[11px] text-[#6B6B56] mt-1 font-medium">
                  {metrics.cuposTotales} cupos totales asignados
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EAE7DC] text-[#5A5A40] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Confirmed Seats Card */}
          <div className="bg-[#F7F3E9] p-5 rounded-2xl border border-[#8D8741]/40 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-[#8D8741] mb-1">
                  Cupos Confirmados
                </p>
                <p className="font-serif-display text-3xl sm:text-4xl font-bold text-[#5A5A40]">
                  {metrics.cuposConfirmados}
                </p>
                <p className="text-[11px] text-[#6B6B56] mt-1 font-medium">
                  {metrics.confirmadosCount} grupos ({metrics.porcentajeConfirmacion}% de aforo)
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EAE7DC] text-[#8D8741] flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Pending Responses Card */}
          <div className="bg-[#F7F3E9] p-5 rounded-2xl border border-[#BC986A]/40 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-[#BC986A] mb-1">
                  Pendientes
                </p>
                <p className="font-serif-display text-3xl sm:text-4xl font-bold text-[#333333]">
                  {metrics.pendientesCount}
                </p>
                <p className="text-[11px] text-[#6B6B56] mt-1 font-medium">
                  Esperando respuesta
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EAE7DC] text-[#BC986A] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Dietary Restrictions Card */}
          <div className="bg-[#F7F3E9] p-5 rounded-2xl border border-[#E0D8C3] shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-[#8D8741] mb-1">
                  Alergias / Dietas
                </p>
                <p className="font-serif-display text-3xl sm:text-4xl font-bold text-[#5A5A40]">
                  {metrics.conAlergiasCount}
                </p>
                <p className="text-[11px] text-[#6B6B56] mt-1 font-medium">
                  Menús especiales catering
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EAE7DC] text-[#8D8741] flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filter Bar and Table */}
        <div className="bg-white rounded-3xl border border-[#E0D8C3] shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 sm:p-6 border-b border-[#E0D8C3] flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-[#F7F3E9]">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#6B6B56]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, código o asistente..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#E0D8C3] rounded-xl text-sm text-[#333333] focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'all'
                    ? 'bg-[#5A5A40] text-white shadow-sm'
                    : 'bg-white border border-[#E0D8C3] text-[#6B6B56] hover:bg-[#EAE7DC]'
                }`}
              >
                Todos ({guests.length})
              </button>
              <button
                onClick={() => setFilterStatus('confirmed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'confirmed'
                    ? 'bg-[#8D8741] text-white shadow-sm'
                    : 'bg-white border border-[#E0D8C3] text-[#5A5A40] hover:bg-[#EAE7DC]'
                }`}
              >
                Confirmados ({metrics.confirmadosCount})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'pending'
                    ? 'bg-[#BC986A] text-white shadow-sm'
                    : 'bg-white border border-[#E0D8C3] text-[#BC986A] hover:bg-[#EAE7DC]'
                }`}
              >
                Pendientes ({metrics.pendientesCount})
              </button>
              <button
                onClick={() => setFilterStatus('declined')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'declined'
                    ? 'bg-[#8D8741]/80 text-white shadow-sm'
                    : 'bg-white border border-[#E0D8C3] text-[#6B6B56] hover:bg-[#EAE7DC]'
                }`}
              >
                No Asisten ({metrics.declinadosCount})
              </button>
              <button
                onClick={() => setFilterStatus('allergies')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'allergies'
                    ? 'bg-[#5A5A40] text-white shadow-sm'
                    : 'bg-white border border-[#E0D8C3] text-[#5A5A40] hover:bg-[#EAE7DC]'
                }`}
              >
                Alergias ({metrics.conAlergiasCount})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-[#EAE7DC] text-[#5A5A40] uppercase text-[11px] tracking-wider border-b border-[#E0D8C3]">
                  <th className="py-3.5 px-4 font-bold">Código</th>
                  <th className="py-3.5 px-4 font-bold">Invitado / Familia</th>
                  <th className="py-3.5 px-4 font-bold">Categoría</th>
                  <th className="py-3.5 px-4 font-bold text-center">Cupos Asignados</th>
                  <th className="py-3.5 px-4 font-bold text-center">Confirmados</th>
                  <th className="py-3.5 px-4 font-bold">Estado RSVP</th>
                  <th className="py-3.5 px-4 font-bold">Alergias & Asistentes</th>
                  <th className="py-3.5 px-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D8C3]/50">
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#6B6B56]">
                      <p className="text-base font-serif-display italic mb-1">
                        No se encontraron invitados con los filtros actuales.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterStatus('all');
                        }}
                        className="text-xs text-[#5A5A40] underline mt-1"
                      >
                        Limpiar filtros
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((g) => (
                    <tr
                      key={g.id}
                      className="hover:bg-[#F7F3E9] transition-colors group"
                    >
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#5A5A40]">
                        <span className="bg-[#EAE7DC] px-2 py-1 rounded-lg border border-[#E0D8C3]">
                          {g.codigo_invitacion}
                        </span>
                      </td>

                      {/* Name & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#333333]">{g.nombre_principal}</div>
                        {g.telefono && (
                          <div className="text-[11px] text-[#6B6B56] flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-[#8D8741]" />
                            <span>{g.telefono}</span>
                          </div>
                        )}
                        {g.mesa_asignada && (
                          <span className="inline-block text-[10px] text-[#5A5A40] font-medium bg-[#EAE7DC] px-1.5 py-0.5 rounded mt-1 border border-[#E0D8C3]">
                            {g.mesa_asignada}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-[#5A5A40] bg-[#EAE7DC] px-2 py-0.5 rounded-full border border-[#E0D8C3]">
                          {g.categoria || 'General'}
                        </span>
                      </td>

                      {/* Max spots */}
                      <td className="py-3.5 px-4 text-center font-bold text-[#333333]">
                        {g.cupos_totales}
                      </td>

                      {/* Confirmed spots */}
                      <td className="py-3.5 px-4 text-center">
                        {g.confirmado ? (
                          <span
                            className={`font-bold text-sm ${
                              g.asistira
                                ? 'text-[#5A5A40] font-serif-display'
                                : 'text-[#BC986A]'
                            }`}
                          >
                            {g.asistira ? `${g.cupos_confirmados} / ${g.cupos_totales}` : '0 (Declina)'}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-mono">-</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {g.confirmado ? (
                          g.asistira ? (
                            <span className="inline-flex items-center gap-1 bg-[#EAE7DC] text-[#5A5A40] text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#BC986A]">
                              <CheckCircle className="w-3 h-3 text-[#8D8741]" />
                              <span>Confirmado</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-[#EAE7DC] text-[#BC986A] text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#E0D8C3]">
                              <X className="w-3 h-3" />
                              <span>No Asiste</span>
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-[#F7F3E9] text-[#6B6B56] text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#E0D8C3]">
                            <Clock className="w-3 h-3 text-[#BC986A]" />
                            <span>Pendiente</span>
                          </span>
                        )}
                      </td>

                      {/* Allergies and attendee names */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {g.asistentes_nombres && g.asistentes_nombres.length > 0 && (
                          <p className="text-xs font-medium text-[#333333] truncate">
                            Asistentes: {g.asistentes_nombres.join(', ')}
                          </p>
                        )}
                        {g.comentarios_dieta ? (
                          <p className="text-xs text-[#5A5A40] bg-[#EAE7DC] p-1.5 rounded-lg border border-[#E0D8C3] mt-1 italic">
                            {g.comentarios_dieta}
                          </p>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Copy Personalized Link */}
                          <button
                            onClick={() => handleCopyLink(g)}
                            title="Copiar enlace personalizado de invitación"
                            className={`p-1.5 rounded-lg transition-all ${
                              copiedGuestId === g.id
                                ? 'bg-[#5A5A40] text-white'
                                : 'text-[#5A5A40] hover:bg-[#EAE7DC]'
                            }`}
                          >
                            {copiedGuestId === g.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          {/* Share by WhatsApp */}
                          <button
                            onClick={() => handleShareWhatsApp(g)}
                            title="Enviar invitación personalizada por WhatsApp"
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          {/* Simulated email view */}
                          {g.confirmado && (
                            <button
                              onClick={() => setSimulatedEmailGuest(g)}
                              title="Ver notificación de correo recibida"
                              className="p-1.5 rounded-lg text-[#5A5A40] hover:bg-[#EAE7DC] transition-colors"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit button */}
                          <button
                            onClick={() => setEditingGuest(g)}
                            title="Editar invitado y cupos"
                            className="p-1.5 rounded-lg text-[#6B6B56] hover:bg-[#EAE7DC] transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Reset RSVP */}
                          {g.confirmado && (
                            <button
                              onClick={() => resetRSVP(g.id)}
                              title="Resetear RSVP a pendiente"
                              className="p-1.5 rounded-lg text-[#BC986A] hover:bg-[#EAE7DC] transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar a ${g.nombre_principal}?`)) {
                                deleteGuest(g.id);
                              }
                            }}
                            title="Eliminar invitado"
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reset Database and Footer helper */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#EAE7DC] border border-[#E0D8C3] text-xs text-[#6B6B56]">
          <div>
            <span>
              Mostrando <strong>{filteredGuests.length}</strong> de{' '}
              <strong>{guests.length}</strong> invitaciones registradas.
            </span>
          </div>
          <button
            onClick={() => {
              if (
                confirm(
                  '¿Deseas restaurar la base de datos de invitados a los valores iniciales de prueba?'
                )
              ) {
                resetAllToDefault();
              }
            }}
            className="text-xs text-[#5A5A40] hover:underline font-semibold"
          >
            Restaurar Base de Datos Inicial de Prueba
          </button>
        </div>
      </div>

      {/* MODAL: ADD GUEST */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFCF0] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#E0D8C3] shadow-2xl animate-fade-in relative">
            <div className="flex justify-between items-center pb-4 border-b border-[#E0D8C3] mb-6">
              <h3 className="font-serif-display text-xl font-bold text-[#333333]">
                Agregar Nuevo Invitado
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#6B6B56] hover:text-[#333333]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A5A40] mb-1">
                  Nombre Principal o Familia <span className="text-[#8D8741]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="EJ: Familia Pérez Gómez o Daniel Morales"
                  className="w-full bg-white border border-[#E0D8C3] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#5A5A40] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A5A40] mb-1">
                    Cupos Asignados <span className="text-[#8D8741]">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={newSpots}
                    onChange={(e) => setNewSpots(Number(e.target.value))}
                    className="w-full bg-white border border-[#E0D8C3] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#5A5A40] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A5A40] mb-1">
                    Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Guest['categoria'])}
                    className="w-full bg-white border border-[#E0D8C3] rounded-xl px-3 py-2.5 text-sm focus:border-[#5A5A40] outline-none"
                  >
                    <option value="Familia Novio">Familia Novio</option>
                    <option value="Familia Novia">Familia Novia</option>
                    <option value="Amigos Novio">Amigos Novio</option>
                    <option value="Amigos Novia">Amigos Novia</option>
                    <option value="Universidad">Universidad</option>
                    <option value="Trabajo">Trabajo</option>
                    <option value="Testigos">Testigos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A5A40] mb-1">
                    Teléfono (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className="w-full bg-white border border-[#E0D8C3] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#5A5A40] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A5A40] mb-1">
                    Mesa Asignada
                  </label>
                  <input
                    type="text"
                    value={newTable}
                    onChange={(e) => setNewTable(e.target.value)}
                    placeholder="Mesa 1, Mesa de Honor..."
                    className="w-full bg-white border border-[#E0D8C3] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#5A5A40] outline-none"
                  />
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">{formError}</div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E0D8C3]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold uppercase text-[#6B6B56] hover:bg-[#EAE7DC] rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-[#5A5A40] text-white rounded-xl hover:bg-[#474732] shadow-sm"
                >
                  Guardar Invitado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT GUEST */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFCF0] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#E0D8C3] shadow-2xl animate-fade-in relative">
            <div className="flex justify-between items-center pb-4 border-b border-[#E0D8C3] mb-6">
              <div>
                <h3 className="font-serif-display text-xl font-bold text-[#333333]">
                  Editar Invitado y Cupos
                </h3>
                <span className="text-xs text-[#6B6B56]">
                  {editingGuest.nombre_principal}
                </span>
              </div>
              <button
                onClick={() => setEditingGuest(null)}
                className="text-[#6B6B56] hover:text-[#333333]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A5A40] mb-1">
                  Nombre Principal / Familia
                </label>
                <input
                  type="text"
                  required
                  value={editingGuest.nombre_principal}
                  onChange={(e) =>
                    setEditingGuest({ ...editingGuest, nombre_principal: e.target.value })
                  }
                  className="w-full bg-white border border-[#E0D8C3] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#5A5A40] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A5A40] mb-1">
                    Cupos Totales
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={editingGuest.cupos_totales}
                    onChange={(e) =>
                      setEditingGuest({
                        ...editingGuest,
                        cupos_totales: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border border-[#E0D8C3] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#5A5A40] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A5A40] mb-1">
                    Categoría
                  </label>
                  <select
                    value={editingGuest.categoria || 'Familia Novio'}
                    onChange={(e) =>
                      setEditingGuest({
                        ...editingGuest,
                        categoria: e.target.value as Guest['categoria'],
                      })
                    }
                    className="w-full bg-white border border-[#E0D8C3] rounded-xl px-3 py-2.5 text-sm focus:border-[#5A5A40] outline-none"
                  >
                    <option value="Familia Novio">Familia Novio</option>
                    <option value="Familia Novia">Familia Novia</option>
                    <option value="Amigos Novio">Amigos Novio</option>
                    <option value="Amigos Novia">Amigos Novia</option>
                    <option value="Universidad">Universidad</option>
                    <option value="Trabajo">Trabajo</option>
                    <option value="Testigos">Testigos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A5A40] mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={editingGuest.telefono || ''}
                    onChange={(e) =>
                      setEditingGuest({ ...editingGuest, telefono: e.target.value })
                    }
                    className="w-full bg-white border border-[#E0D8C3] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#5A5A40] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A5A40] mb-1">
                    Mesa Asignada
                  </label>
                  <input
                    type="text"
                    value={editingGuest.mesa_asignada || ''}
                    onChange={(e) =>
                      setEditingGuest({ ...editingGuest, mesa_asignada: e.target.value })
                    }
                    className="w-full bg-white border border-[#E0D8C3] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#5A5A40] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A5A40] mb-1">
                  Restricciones / Dietas
                </label>
                <textarea
                  rows={2}
                  value={editingGuest.comentarios_dieta || ''}
                  onChange={(e) =>
                    setEditingGuest({
                      ...editingGuest,
                      comentarios_dieta: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-[#E0D8C3] rounded-xl p-2.5 text-sm focus:border-[#5A5A40] outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E0D8C3]">
                <button
                  type="button"
                  onClick={() => setEditingGuest(null)}
                  className="px-4 py-2 text-xs font-semibold uppercase text-[#6B6B56] hover:bg-[#EAE7DC] rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-[#5A5A40] text-white rounded-xl hover:bg-[#474732] shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SIMULATED EMAIL NOTIFICATION (as in the prompt specification) */}
      {simulatedEmailGuest && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#FDFCF0] border border-[#E0D8C3] rounded-3xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-[#EAE7DC] border-b border-[#E0D8C3] flex justify-between items-center">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#8D8741] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulación de Alerta de Correo (Webhook Supabase)</span>
              </span>
              <button
                onClick={() => setSimulatedEmailGuest(null)}
                className="text-[#6B6B56] hover:text-[#333333]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Body Card */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-center">
              {/* Header */}
              <div className="pb-6 border-b border-[#E0D8C3]">
                <div className="w-12 h-12 rounded-full bg-[#EAE7DC] text-[#8D8741] flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="font-serif-display text-2xl font-bold text-[#5A5A40] tracking-widest uppercase">
                  Bárbara & Daniel
                </h2>
                <p className="text-xs uppercase tracking-[0.2em] text-[#6B6B56] mt-1">
                  Notificación Administrativa
                </p>
              </div>

              {/* Main Greeting */}
              <div>
                <h3 className="font-serif-display text-2xl font-bold text-[#333333] mb-2">
                  ¡Nueva Confirmación Recibida!
                </h3>
                <p className="text-sm text-[#6B6B56] leading-relaxed">
                  Hola Daniel & Bárbara, un invitado acaba de enviar su respuesta para el matrimonio:
                </p>
              </div>

              {/* Details Card */}
              <div className="bg-[#F7F3E9] rounded-2xl p-5 border border-[#E0D8C3] text-left space-y-3 text-sm shadow-sm">
                <div className="flex justify-between items-center pb-2.5 border-b border-[#E0D8C3]">
                  <span className="text-xs uppercase tracking-wider text-[#6B6B56] font-semibold">
                    Invitado / Familia
                  </span>
                  <span className="font-bold text-[#5A5A40]">{simulatedEmailGuest.nombre_principal}</span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-[#E0D8C3]">
                  <span className="text-xs uppercase tracking-wider text-[#6B6B56] font-semibold">
                    Asistencia Confirmada
                  </span>
                  <span className="font-bold text-[#333333]">
                    {simulatedEmailGuest.asistira
                      ? `${simulatedEmailGuest.cupos_confirmados} de ${simulatedEmailGuest.cupos_totales} Cupos`
                      : 'No Asistirá'}
                  </span>
                </div>
                {simulatedEmailGuest.asistentes_nombres &&
                  simulatedEmailGuest.asistentes_nombres.length > 0 && (
                    <div className="pb-2.5 border-b border-[#E0D8C3]">
                      <span className="text-xs uppercase tracking-wider text-[#6B6B56] font-semibold block mb-1">
                        Nombres Asistentes
                      </span>
                      <p className="text-xs text-[#333333] font-medium">
                        {simulatedEmailGuest.asistentes_nombres.join(', ')}
                      </p>
                    </div>
                  )}
                <div className="flex justify-between items-start pt-1">
                  <span className="text-xs uppercase tracking-wider text-[#6B6B56] font-semibold w-1/3">
                    Alergias / Notas
                  </span>
                  <span className="text-xs text-[#333333] text-right w-2/3 italic">
                    {simulatedEmailGuest.comentarios_dieta || 'Sin restricciones especiales indicadas.'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-[#6B6B56]">
                <span>Código: </span>
                <strong className="font-mono">{simulatedEmailGuest.codigo_invitacion}</strong> &bull;{' '}
                <span>Fecha: </span>
                {simulatedEmailGuest.fecha_confirmacion
                  ? new Date(simulatedEmailGuest.fecha_confirmacion).toLocaleString('es-CL')
                  : 'Recientemente'}
              </div>

              <button
                onClick={() => setSimulatedEmailGuest(null)}
                className="inline-block bg-[#5A5A40] text-white font-semibold text-xs uppercase tracking-widest py-3 px-8 rounded-full hover:bg-[#474732] transition-colors shadow-sm"
              >
                Cerrar Notificación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
