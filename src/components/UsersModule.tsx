import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Key, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  CheckSquare, 
  Square, 
  UserCheck, 
  Sparkles,
  LayoutDashboard,
  GraduationCap,
  Calendar,
  Receipt,
  Package,
  FileText,
  ShoppingBag,
  Boxes,
  Contact,
  Users,
  Compass,
  TrendingUp,
  TrendingDown,
  Building2,
  Calculator,
  Settings,
  LogIn
} from 'lucide-react';
import { UsuarioSistema, CargoUsuario } from '../types';
import { ALL_MODULE_PERMISSIONS, ROLE_PRESET_PERMISSIONS } from '../initialData';
import { useAlertConfirm } from '../context/AlertConfirmContext';

interface UsersModuleProps {
  usuarios: UsuarioSistema[];
  currentUser: UsuarioSistema | null;
  onSaveUsuarios: (newUsers: UsuarioSistema[]) => void;
  onSwitchUser?: (user: UsuarioSistema) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  GraduationCap: <GraduationCap className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  UserCheck: <UserCheck className="h-4 w-4" />,
  Receipt: <Receipt className="h-4 w-4" />,
  Package: <Package className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  ShoppingBag: <ShoppingBag className="h-4 w-4" />,
  Boxes: <Boxes className="h-4 w-4" />,
  Contact: <Contact className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  UserPlus: <UserPlus className="h-4 w-4" />,
  Compass: <Compass className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  TrendingDown: <TrendingDown className="h-4 w-4" />,
  Building2: <Building2 className="h-4 w-4" />,
  Calculator: <Calculator className="h-4 w-4" />,
  ShieldCheck: <ShieldCheck className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
};

export default function UsersModule({
  usuarios,
  currentUser,
  onSaveUsuarios,
  onSwitchUser
}: UsersModuleProps) {
  const { showAlert, showConfirm } = useAlertConfirm();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCargo, setFilterCargo] = useState<string>('TODOS');
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioSistema | null>(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userForPassword, setUserForPassword] = useState<UsuarioSistema | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    nombre: string;
    username: string;
    password: string;
    cargo: CargoUsuario;
    email: string;
    telefono: string;
    estado: 'Activo' | 'Inactivo';
    permisos: string[];
  }>({
    nombre: '',
    username: '',
    password: '',
    cargo: 'Recepcionista',
    email: '',
    telefono: '',
    estado: 'Activo',
    permisos: ROLE_PRESET_PERMISSIONS['Recepcionista'] || []
  });

  const [showFormPassword, setShowFormPassword] = useState(false);

  // Filtered users
  const filteredUsers = usuarios.filter(user => {
    const matchesSearch = 
      user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.cargo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCargo = filterCargo === 'TODOS' || user.cargo === filterCargo;
    const matchesEstado = filterEstado === 'TODOS' || user.estado === filterEstado;

    return matchesSearch && matchesCargo && matchesEstado;
  });

  // Open modal for new user
  const handleOpenNewUser = () => {
    setEditingUser(null);
    setFormData({
      nombre: '',
      username: '',
      password: '',
      cargo: 'Recepcionista',
      email: '',
      telefono: '',
      estado: 'Activo',
      permisos: [...ROLE_PRESET_PERMISSIONS['Recepcionista']]
    });
    setShowFormPassword(false);
    setIsModalOpen(true);
  };

  // Open modal for editing user
  const handleOpenEditUser = (user: UsuarioSistema) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      username: user.username,
      password: user.password,
      cargo: user.cargo,
      email: user.email || '',
      telefono: user.telefono || '',
      estado: user.estado,
      permisos: [...user.permisos]
    });
    setShowFormPassword(false);
    setIsModalOpen(true);
  };

  // Cargo change handler - auto applies permissions preset
  const handleCargoChange = (newCargo: CargoUsuario) => {
    const defaultPerms = ROLE_PRESET_PERMISSIONS[newCargo] || [];
    setFormData(prev => ({
      ...prev,
      cargo: newCargo,
      permisos: [...defaultPerms]
    }));
  };

  // Permission toggle handler
  const handleTogglePermission = (modId: string) => {
    setFormData(prev => {
      const exists = prev.permisos.includes(modId);
      const updated = exists 
        ? prev.permisos.filter(p => p !== modId)
        : [...prev.permisos, modId];
      return { ...prev, permisos: updated };
    });
  };

  // Select all / clear all perms
  const handleSelectAllPerms = () => {
    setFormData(prev => ({
      ...prev,
      permisos: ALL_MODULE_PERMISSIONS.map(m => m.id)
    }));
  };

  const handleClearAllPerms = () => {
    setFormData(prev => ({
      ...prev,
      permisos: ['dashboard'] // keep dashboard at least
    }));
  };

  // Save user handler
  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.username.trim() || !formData.password.trim()) {
      showAlert('Atención', 'Por favor complete el nombre, usuario y contraseña.', 'warning');
      return;
    }

    // Check duplicate username
    const usernameClean = formData.username.trim().toLowerCase();
    const isDuplicate = usuarios.some(u => 
      u.username.toLowerCase() === usernameClean && u.id !== editingUser?.id
    );

    if (isDuplicate) {
      showAlert('Usuario existente', 'Ese nombre de usuario ya está registrado en el sistema. Elige otro.', 'error');
      return;
    }

    if (formData.permisos.length === 0) {
      showAlert('Sin casillas permitidas', 'Debes seleccionar al menos 1 casilla de acceso para este usuario.', 'warning');
      return;
    }

    const now = new Date();
    const dateFormatted = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    if (editingUser) {
      // Update
      const updated = usuarios.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            nombre: formData.nombre.trim(),
            username: usernameClean,
            password: formData.password,
            cargo: formData.cargo,
            email: formData.email.trim(),
            telefono: formData.telefono.trim(),
            estado: formData.estado,
            permisos: formData.permisos
          };
        }
        return u;
      });
      onSaveUsuarios(updated);
      showAlert('Usuario Actualizado', `La cuenta de "${formData.nombre}" ha sido modificada con éxito.`, 'success');
    } else {
      // Create new
      const newUser: UsuarioSistema = {
        id: `usr-${Date.now()}`,
        nombre: formData.nombre.trim(),
        username: usernameClean,
        password: formData.password,
        cargo: formData.cargo,
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        estado: formData.estado,
        permisos: formData.permisos,
        esSuperAdmin: false,
        fechaCreacion: dateFormatted,
        ultimoAcceso: 'Nunca'
      };
      onSaveUsuarios([newUser, ...usuarios]);
      showAlert('Usuario Creado', `La cuenta de "${formData.nombre}" con usuario @${usernameClean} ha sido creada correctamente.`, 'success');
    }

    setIsModalOpen(false);
  };

  // Toggle state (Activo/Inactivo)
  const handleToggleEstado = async (user: UsuarioSistema) => {
    if (user.esSuperAdmin) {
      showAlert('Acción denegada', 'No se puede desactivar la cuenta del Administrador Principal.', 'error');
      return;
    }

    const newEstado = user.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const confirm = await showConfirm(
      'Cambiar Estado de Usuario',
      `¿Deseas cambiar el estado de "${user.nombre}" a ${newEstado.toUpperCase()}?`
    );

    if (confirm) {
      const updated = usuarios.map(u => u.id === user.id ? { ...u, estado: newEstado as 'Activo'|'Inactivo' } : u);
      onSaveUsuarios(updated);
    }
  };

  // Delete user
  const handleDeleteUser = async (user: UsuarioSistema) => {
    if (user.esSuperAdmin) {
      showAlert('Acción denegada', 'No se puede eliminar la cuenta del Director General Principal.', 'error');
      return;
    }

    if (user.id === currentUser?.id) {
      showAlert('Acción denegada', 'No puedes eliminar tu propia cuenta en sesión actual.', 'error');
      return;
    }

    const confirm = await showConfirm(
      'Eliminar Usuario',
      `¿Estás seguro de que deseas eliminar permanentemente la cuenta de "${user.nombre}" (@${user.username})? esta acción no se puede deshacer.`,
      'destructive'
    );

    if (confirm) {
      const updated = usuarios.filter(u => u.id !== user.id);
      onSaveUsuarios(updated);
      showAlert('Usuario Eliminado', 'La cuenta ha sido removida del sistema.', 'info');
    }
  };

  // Open password modal
  const handleOpenPasswordModal = (user: UsuarioSistema) => {
    setUserForPassword(user);
    setNewPasswordValue(user.password);
    setShowNewPassword(false);
    setIsPasswordModalOpen(true);
  };

  // Submit password change
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForPassword || !newPasswordValue.trim()) return;

    const updated = usuarios.map(u => u.id === userForPassword.id ? { ...u, password: newPasswordValue.trim() } : u);
    onSaveUsuarios(updated);
    setIsPasswordModalOpen(false);
    showAlert('Contraseña Actualizada', `Se ha actualizado la contraseña para @${userForPassword.username} correctamente.`, 'success');
  };

  // Get cargo badge color
  const getCargoBadge = (cargo: CargoUsuario) => {
    switch (cargo) {
      case 'Director General':
        return 'bg-amber-500/10 text-gold-400 border-amber-500/30';
      case 'Administrador':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Recepcionista':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Profesor':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Contador':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const totalUsuarios = usuarios.length;
  const totalActivos = usuarios.filter(u => u.estado === 'Activo').length;
  const totalInactivos = usuarios.filter(u => u.estado === 'Inactivo').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">
              Gestión de Usuarios y Permisos
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Crea accesos con usuario y contraseña, asigna roles académicos y selecciona exactamente qué casillas/pestañas puede manipular cada persona.
          </p>
        </div>

        <button
          onClick={handleOpenNewUser}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 px-5 py-3 text-sm font-bold text-zinc-950 hover:from-gold-400 hover:to-amber-500 shadow-lg shadow-gold-500/20 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="h-4 w-4 stroke-[2.5]" />
          <span>Crear Nuevo Usuario</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Cuentas</span>
            <Users className="h-5 w-5 text-gold-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{totalUsuarios}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Cuentas registradas en el sistema</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Usuarios Activos</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-300">{totalActivos}</div>
          <p className="text-[11px] text-emerald-500/80 mt-1">Con acceso habilitado para ingresar</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Inactivos / Suspendidos</span>
            <XCircle className="h-5 w-5 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-300">{totalInactivos}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Acceso bloqueado temporalmente</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario (@ejemplo), cargo o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-700/70 bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Cargo */}
          <select
            value={filterCargo}
            onChange={(e) => setFilterCargo(e.target.value)}
            className="rounded-xl border border-zinc-700/70 bg-zinc-950 px-3 py-2.5 text-xs font-medium text-white focus:border-gold-500 focus:outline-none"
          >
            <option value="TODOS">Todos los Cargos</option>
            <option value="Director General">Director General</option>
            <option value="Administrador">Administrador</option>
            <option value="Recepcionista">Recepcionista</option>
            <option value="Profesor">Profesor</option>
            <option value="Contador">Contador</option>
            <option value="Personalizado">Personalizado</option>
          </select>

          {/* Filter Estado */}
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="rounded-xl border border-zinc-700/70 bg-zinc-950 px-3 py-2.5 text-xs font-medium text-white focus:border-gold-500 focus:outline-none"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Users List Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950/80 text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-5 py-4">Usuario / Nombre</th>
                <th className="px-5 py-4">Cargo / Rol</th>
                <th className="px-5 py-4">Clave de Acceso</th>
                <th className="px-5 py-4">Casillas / Permisos</th>
                <th className="px-5 py-4 text-center">Estado</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                    <User className="h-8 w-8 mx-auto mb-2 text-zinc-600 opacity-50" />
                    No se encontraron usuarios registrados con esos criterios.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const allowedCount = u.permisos.length;
                  const totalMods = ALL_MODULE_PERMISSIONS.length;
                  const isCurrent = currentUser?.id === u.id;

                  return (
                    <tr key={u.id} className={`hover:bg-zinc-800/40 transition-colors ${isCurrent ? 'bg-gold-500/5' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-gold-400 font-black text-sm shrink-0">
                            {u.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{u.nombre}</span>
                              {u.esSuperAdmin && (
                                <span className="rounded bg-gold-500/20 px-1.5 py-0.5 text-[10px] font-extrabold text-gold-400 border border-gold-500/30">
                                  SUPERADMIN
                                </span>
                              )}
                              {isCurrent && (
                                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/30">
                                  TÚ EN SESIÓN
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-mono text-gold-500/90 flex items-center gap-1">
                              <span>@{u.username}</span>
                              {u.email && <span className="text-zinc-500 text-[11px] font-sans">• {u.email}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getCargoBadge(u.cargo)}`}>
                          {u.cargo}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-800 text-zinc-400">
                            ••••••••
                          </span>
                          <button
                            onClick={() => handleOpenPasswordModal(u)}
                            className="p-1 text-zinc-400 hover:text-gold-400 hover:bg-zinc-800 rounded transition-colors"
                            title="Ver o cambiar contraseña"
                          >
                            <Key className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                            <Shield className="h-3.5 w-3.5 text-gold-500" />
                            <span>{allowedCount} de {totalMods} casillas</span>
                          </div>
                          <div className="w-32 bg-zinc-950 rounded-full h-1.5 mt-1.5 overflow-hidden border border-zinc-800">
                            <div 
                              className="bg-gradient-to-r from-gold-500 to-amber-500 h-full rounded-full" 
                              style={{ width: `${(allowedCount / totalMods) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleToggleEstado(u)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            u.estado === 'Activo'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                        >
                          {u.estado === 'Activo' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span>{u.estado}</span>
                        </button>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test session switch */}
                          {onSwitchUser && (
                            <button
                              onClick={() => {
                                onSwitchUser(u);
                                showAlert('Sesión Iniciada', `Has cambiado a la cuenta de ${u.nombre} (@${u.username}).`, 'info');
                              }}
                              className="flex items-center gap-1 rounded-lg bg-zinc-800 hover:bg-gold-500 hover:text-zinc-950 px-2.5 py-1.5 text-xs font-bold text-zinc-300 transition-all"
                              title="Iniciar sesión con este usuario para probar su vista"
                            >
                              <LogIn className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Entrar</span>
                            </button>
                          )}

                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-gold-500/20 hover:text-gold-400 transition-colors"
                            title="Editar Datos y Permisos"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={u.esSuperAdmin || isCurrent}
                            className={`p-2 rounded-lg transition-colors ${
                              u.esSuperAdmin || isCurrent 
                                ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed' 
                                : 'bg-zinc-800 text-rose-400 hover:bg-rose-500/20'
                            }`}
                            title={u.esSuperAdmin ? 'No se puede eliminar al Administrador Principal' : 'Eliminar Usuario'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    {editingUser ? `Editar Usuario: ${editingUser.nombre}` : 'Crear Nuevo Usuario del Sistema'}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Define credenciales y personaliza qué casillas de acceso tendrá habilitadas.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitUser} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Account Data Grid */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold-500 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>1. Datos Principales y Credenciales de Acceso</span>
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Nombre completo */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      Nombre Completo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. María Josefa Almonte"
                      value={formData.nombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-gold-500 focus:outline-none"
                    />
                  </div>

                  {/* Nombre de usuario */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      Usuario de Ingreso (@username) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">@</span>
                      <input
                        type="text"
                        required
                        placeholder="maria.almonte"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/\s+/g, '') }))}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-8 pr-3.5 py-2.5 text-sm font-mono text-gold-400 placeholder-zinc-600 focus:border-gold-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      Contraseña de Acceso <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showFormPassword ? "text" : "password"}
                        required
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-3.5 pr-10 py-2.5 text-sm font-mono text-white placeholder-zinc-600 focus:border-gold-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        {showFormPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Cargo / Rol Preset */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      Cargo en la Academia <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.cargo}
                      onChange={(e) => handleCargoChange(e.target.value as CargoUsuario)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm font-bold text-white focus:border-gold-500 focus:outline-none"
                    >
                      <option value="Director General">Director General (Acceso Total)</option>
                      <option value="Administrador">Administrador (Acceso Total)</option>
                      <option value="Recepcionista">Recepcionista (Alumnos, POS, Asistencia)</option>
                      <option value="Profesor">Profesor (Clases, Asistencia, Suplencias)</option>
                      <option value="Contador">Contador (Caja, Ingresos, Egresos)</option>
                      <option value="Personalizado">Personalizado (Elegir casillas a mano)</option>
                    </select>
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="ejemplo@newdancerd.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-gold-500 focus:outline-none"
                    />
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">Estado de la Cuenta</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as 'Activo'|'Inactivo' }))}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm font-bold text-white focus:border-gold-500 focus:outline-none"
                    >
                      <option value="Activo">🟢 Activo (Puede Iniciar Sesión)</option>
                      <option value="Inactivo">🔴 Inactivo / Suspendido (Acceso Bloqueado)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Module Permissions Checkbox Grid */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gold-500 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>2. Seleccionar Casillas / Módulos Permitidos ({formData.permisos.length} de {ALL_MODULE_PERMISSIONS.length})</span>
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Marca las pestañas a las que este usuario tendrá autorización de ingresar en el menú.
                    </p>
                  </div>

                  {/* Fast Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleSelectAllPerms}
                      className="rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-bold text-gold-400 hover:bg-gold-500 hover:text-zinc-950 transition-colors"
                    >
                      Marcar Todas
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllPerms}
                      className="rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-bold text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                    >
                      Desmarcar
                    </button>
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 pt-2">
                  {ALL_MODULE_PERMISSIONS.map((mod) => {
                    const isChecked = formData.permisos.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => handleTogglePermission(mod.id)}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked 
                            ? 'bg-gold-500/10 border-gold-500/40 text-white shadow-md shadow-gold-500/5' 
                            : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                      >
                        <div className={`mt-0.5 shrink-0 ${isChecked ? 'text-gold-400' : 'text-zinc-600'}`}>
                          {isChecked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                            <span className={isChecked ? 'text-gold-400' : 'text-zinc-400'}>
                              {ICON_MAP[mod.icon] || <LayoutDashboard className="h-4 w-4" />}
                            </span>
                            <span className="truncate">{mod.label}</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
                            {mod.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl bg-zinc-800 px-5 py-2.5 text-xs font-bold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 px-6 py-2.5 text-xs font-bold text-zinc-950 hover:from-gold-400 hover:to-amber-500 shadow-lg shadow-gold-500/20 transition-all cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{editingUser ? 'Guardar Cambios' : 'Crear Cuenta de Usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && userForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Cambiar Contraseña</h3>
                <p className="text-xs text-zinc-400">Usuario: <span className="text-gold-400 font-mono">@{userForPassword.username}</span></p>
              </div>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-3.5 pr-10 py-2.5 text-sm font-mono text-white focus:border-gold-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gold-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-gold-400"
                >
                  Guardar Nueva Clave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
