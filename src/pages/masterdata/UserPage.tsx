import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useOutlets } from '../../hooks/useOutlets';
import { User, UserRole } from '../../types';
import { Button, Card, Input, Select, Badge } from '../../components/common';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export const UserPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { outlets } = useOutlets();
  const { showToast } = useUIStore();

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('name');
    if (data) {
      setUsers(data.map((p: any) => ({
        id: p.id,
        username: p.username,
        password: '',
        name: p.name,
        role: p.role,
        outletId: p.outlet_id,
        division: p.division,
        isActive: p.is_active,
        createdAt: p.created_at,
      })));
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('kasir');
  const [outletId, setOutletId] = useState('');
  const [division, setDivision] = useState('Es Teh');
  const [isActive, setIsActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingId(null);
    setUsername('');
    setName('');
    setPassword('');
    setRole('kasir');
    setOutletId(outlets[0]?.id || '');
    setDivision('Es Teh');
    setIsActive(true);
    setShowForm(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingId(user.id);
    setUsername(user.username);
    setName(user.name);
    setPassword(user.password);
    setRole(user.role);
    setOutletId(user.outletId || '');
    setDivision(user.division || 'Es Teh');
    setIsActive(user.isActive);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !name || !password) {
      showToast('Semua field wajib diisi!', 'error');
      return;
    }

    if (editingId) {
      const { error } = await supabase.from('profiles').update({
        username,
        name,
        role,
        outlet_id: role === 'kasir' || role === 'supervisor' ? outletId : null,
        division: role === 'kasir' || role === 'supervisor' ? division : null,
        is_active: isActive,
      }).eq('id', editingId);
      if (error) { showToast('Gagal memperbarui user!', 'error'); return; }
      showToast('User berhasil diperbarui!', 'success');
      fetchUsers();
    } else {
      const email = username.includes('@') ? username : `${username}@pertamapos.local`;
      const { error } = await supabase.rpc('create_user_admin', {
        p_username: username,
        p_email: email,
        p_password: password,
        p_name: name,
        p_role: role,
        p_outlet_id: role === 'kasir' || role === 'supervisor' ? outletId : null,
        p_division: role === 'kasir' || role === 'supervisor' ? division : null,
      });
      if (error) { showToast(error.message || 'Gagal menambahkan user!', 'error'); return; }
      showToast('User baru berhasil ditambahkan!', 'success');
      fetchUsers();
    }

    setShowForm(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Hapus pengguna "${name}"?`)) {
      const { error } = await supabase.rpc('delete_user_admin', { p_user_id: id });
      if (error) { showToast(error.message || 'Gagal menghapus user!', 'error'); return; }
      showToast('User berhasil dihapus!', 'success');
      fetchUsers();
    }
  };

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'kasir', label: 'Kasir' },
  ];

  const divisionOptions = [
    { value: 'Es Teh', label: 'Es Teh' },
    { value: 'Tahu', label: 'Tahu' },
    { value: 'Roti Bakar', label: 'Roti Bakar' },
    { value: 'Lainnya', label: 'Lainnya' },
  ];

  const outletOptions = outlets.map((o) => ({
    value: o.id,
    label: o.name,
  }));

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowForm(false)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {editingId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
          </h2>
        </div>

        <Card className="max-w-xl">
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Nama Lengkap"
              id="name"
              type="text"
              placeholder="Contoh: Budi Hartono"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Username"
              id="username"
              type="text"
              placeholder="Username untuk login"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="Password login"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Select
              label="Peran / Role"
              id="role"
              options={roleOptions}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              required
            />

            {(role === 'kasir' || role === 'supervisor') && (
              <>
                <Select
                  label="Outlet Tugas"
                  id="outletId"
                  options={outletOptions}
                  value={outletId}
                  onChange={(e) => setOutletId(e.target.value)}
                  required
                />

                <Select
                  label="Bidang / Divisi Tugas"
                  id="division"
                  options={divisionOptions}
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  required
                />
              </>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                Pengguna Aktif (Bisa Login)
              </label>
            </div>

            <div className="pt-4 border-t border-gray-100 flex space-x-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1">
                Simpan User
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manajemen Pengguna</h2>
          <p className="text-sm text-gray-500 mt-1">Mengelola daftar pengguna, peran, dan outlet tugas</p>
        </div>
        <Button onClick={handleOpenAdd} leftIcon={<Plus className="h-5 w-5" />}>
          Tambah User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const userOutlet = outlets.find((o) => o.id === u.outletId);
          return (
            <Card key={u.id} className="relative flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{u.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">@{u.username}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-3" />

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Peran/Role:</span>
                    <Badge variant={u.role === 'admin' ? 'danger' : 'default'} size="sm" className="capitalize">
                      {u.role}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tugas Outlet:</span>
                    <span className="font-semibold text-gray-800">
                      {userOutlet?.name || 'Semua Outlet (Multi-outlet)'}
                    </span>
                  </div>
                  {u.division && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bidang/Divisi:</span>
                      <span className="font-semibold text-gray-800">{u.division}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <Badge variant={u.isActive ? 'success' : 'warning'} size="sm">
                      {u.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
export default UserPage;
