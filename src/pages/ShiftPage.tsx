import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useOutlets } from '../hooks/useOutlets';
import { formatCurrency } from '../utils/calculations';
import { formatDate } from '../utils/date';
import { Card, Badge, Button, Input, Select } from '../components/common';
import { Clock, Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { Shift, Outlet, User } from '../types';
import { useUIStore } from '../stores/uiStore';

function mapShift(s: any): Shift {
  return {
    id: s.id,
    shiftNumber: s.shift_number,
    kasirId: s.kasir_id,
    kasirName: s.kasir_name,
    outletId: s.outlet_id,
    openingBalance: s.opening_balance,
    closingBalance: s.closing_balance,
    actualBalance: s.actual_balance,
    variance: s.variance,
    openedAt: s.opened_at,
    closedAt: s.closed_at,
    notes: s.notes,
    status: s.status,
  };
}

export const ShiftPage: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { outlets } = useOutlets();
  const { showToast } = useUIStore();

  const fetchShifts = async () => {
    const { data } = await supabase.from('shifts').select('*').order('opened_at', { ascending: false });
    if (data) setShifts(data.map(mapShift));
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*');
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

  useEffect(() => { fetchShifts(); fetchUsers(); }, []);

  const addShift = async (shift: Omit<Shift, 'id'>) => {
    await supabase.from('shifts').insert({
      shift_number: shift.shiftNumber,
      kasir_id: shift.kasirId,
      kasir_name: shift.kasirName,
      outlet_id: shift.outletId,
      opening_balance: shift.openingBalance,
      actual_balance: shift.actualBalance,
      status: shift.status,
      notes: shift.notes,
      opened_at: shift.openedAt,
      closed_at: shift.closedAt,
    });
    fetchShifts();
  };

  const updateShift = async (shift: Shift) => {
    await supabase.from('shifts').update({
      shift_number: shift.shiftNumber,
      kasir_id: shift.kasirId,
      kasir_name: shift.kasirName,
      outlet_id: shift.outletId,
      opening_balance: shift.openingBalance,
      actual_balance: shift.actualBalance,
      status: shift.status,
      notes: shift.notes,
      closed_at: shift.closedAt,
    }).eq('id', shift.id);
    fetchShifts();
  };

  const deleteShift = async (id: string) => {
    await supabase.from('shifts').delete().eq('id', id);
    fetchShifts();
  };

  const [selectedOutlet, setSelectedOutlet] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [kasirId, setKasirId] = useState('');
  const [outletId, setOutletId] = useState('');
  const [shiftNumber, setShiftNumber] = useState<'1' | '2' | '3'>('1');
  const [openingBalance, setOpeningBalance] = useState('');
  const [actualBalance, setActualBalance] = useState('');
  const [status, setStatus] = useState<'open' | 'closed'>('closed');
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setKasirId(users[0]?.id || '');
    setOutletId(outlets[0]?.id || '');
    setShiftNumber('1');
    setOpeningBalance('100000');
    setActualBalance('100000');
    setStatus('closed');
    setNotes('');
    setShowForm(true);
  };

  const handleOpenEdit = (shift: Shift) => {
    setEditingId(shift.id);
    setKasirId(shift.kasirId);
    setOutletId(shift.outletId);
    setShiftNumber(shift.shiftNumber.toString() as '1' | '2' | '3');
    setOpeningBalance(shift.openingBalance.toString());
    setActualBalance((shift.actualBalance || 0).toString());
    setStatus(shift.status);
    setNotes(shift.notes || '');
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!kasirId || !outletId || !openingBalance) {
      showToast('Mohon isi field Kasir, Outlet, dan Saldo Awal!', 'error');
      return;
    }

    const selectedUser = users.find((u) => u.id === kasirId);
    if (!selectedUser) return;

    const opBal = parseFloat(openingBalance) || 0;
    const actBal = parseFloat(actualBalance) || 0;

    if (editingId) {
      const existing = shifts.find((s) => s.id === editingId);
      if (!existing) return;
      const updated: Shift = {
        ...existing,
        shiftNumber: parseInt(shiftNumber) as 1 | 2 | 3,
        kasirId,
        kasirName: selectedUser.name,
        outletId,
        openingBalance: opBal,
        actualBalance: status === 'closed' ? actBal : undefined,
        status,
        notes,
        closedAt: status === 'closed' ? (existing.closedAt || new Date().toISOString()) : undefined,
      };
      updateShift(updated);
      showToast('Shift berhasil diperbarui!', 'success');
    } else {
      const newShift: Shift = {
        id: `shift-${Date.now()}`,
        shiftNumber: parseInt(shiftNumber) as 1 | 2 | 3,
        kasirId,
        kasirName: selectedUser.name,
        outletId,
        openingBalance: opBal,
        actualBalance: status === 'closed' ? actBal : undefined,
        status,
        notes,
        openedAt: new Date().toISOString(),
        closedAt: status === 'closed' ? new Date().toISOString() : undefined,
      };
      addShift(newShift);
      showToast('Shift baru ditambahkan!', 'success');
    }

    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus catatan shift ini dari sistem?')) {
      deleteShift(id);
      showToast('Shift berhasil dihapus!', 'success');
    }
  };

  const filteredShifts = shifts.filter(
    (s: Shift) => selectedOutlet === 'All' || s.outletId === selectedOutlet
  );

  const kasirOptions = users.map((u) => ({
    value: u.id,
    label: `${u.name} (${u.role})`,
  }));

  const outletOptions = outlets.map((o) => ({
    value: o.id,
    label: o.name,
  }));

  const shiftOptions = [
    { value: '1', label: 'Shift 1' },
    { value: '2', label: 'Shift 2' },
    { value: '3', label: 'Shift 3' },
  ];

  const statusOptions = [
    { value: 'open', label: 'Aktif (Open)' },
    { value: 'closed', label: 'Tutup (Closed)' },
  ];

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
            {editingId ? 'Edit Catatan Shift' : 'Tambah Catatan Shift Baru'}
          </h2>
        </div>

        <Card className="max-w-xl">
          <form onSubmit={handleSave} className="space-y-4">
            <Select
              label="Pilih Kasir"
              id="kasirId"
              options={kasirOptions}
              value={kasirId}
              onChange={(e) => setKasirId(e.target.value)}
              required
            />

            <Select
              label="Pilih Outlet"
              id="outletId"
              options={outletOptions}
              value={outletId}
              onChange={(e) => setOutletId(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Nomor Shift"
                id="shiftNumber"
                options={shiftOptions}
                value={shiftNumber}
                onChange={(e) => setShiftNumber(e.target.value as '1' | '2' | '3')}
                required
              />

              <Select
                label="Status Shift"
                id="status"
                options={statusOptions}
                value={status}
                onChange={(e) => setStatus(e.target.value as 'open' | 'closed')}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Saldo Awal Kas (Rp)"
                id="openingBalance"
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                required
              />

              {status === 'closed' && (
                <Input
                  label="Saldo Sebenarnya Kas (Rp)"
                  id="actualBalance"
                  type="number"
                  value={actualBalance}
                  onChange={(e) => setActualBalance(e.target.value)}
                />
              )}
            </div>

            <Input
              label="Catatan Shift"
              id="notes"
              type="text"
              placeholder="Masukkan informasi tambahan"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

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
                Simpan Shift
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
          <h2 className="text-xl font-bold text-gray-900">Manajemen Shift & Rekonsiliasi</h2>
          <p className="text-sm text-gray-500 mt-1">
            Melacak status pembukaan/penutupan shift kasir, saldo awal/akhir, dan selisih (variance) kas
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
            className="rounded-lg border border-gray-300 text-sm px-3 py-2 focus:outline-none bg-white font-semibold"
          >
            <option value="All">Semua Outlet</option>
            {outlets.map((o: Outlet) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <Button onClick={handleOpenAdd} leftIcon={<Plus className="h-5 w-5" />}>
            Tambah Shift
          </Button>
        </div>
      </div>

      {filteredShifts.length === 0 ? (
        <Card className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-2xl">
          Belum ada riwayat shift yang tercatat.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredShifts.slice().reverse().map((shift: Shift) => {
            const outletName = outlets.find((o: Outlet) => o.id === shift.outletId)?.name || shift.outletId;
            const isClosed = shift.status === 'closed';

            return (
              <Card key={shift.id} className="relative flex flex-col justify-between p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-lg flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-primary-500" />
                        Shift {shift.shiftNumber}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{outletName}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={isClosed ? 'default' : 'success'} size="sm">
                        {isClosed ? 'Closed' : 'Active'}
                      </Badge>
                      <button
                        onClick={() => handleOpenEdit(shift)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(shift.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 my-2" />

                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Kasir:</span>
                      <span className="font-semibold text-gray-800">{shift.kasirName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dibuka Pada:</span>
                      <span className="font-semibold text-gray-800">{formatDate(shift.openedAt, 'dd MMM yyyy HH:mm')}</span>
                    </div>
                    {shift.closedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ditutup Pada:</span>
                        <span className="font-semibold text-gray-800">{formatDate(shift.closedAt, 'dd MMM yyyy HH:mm')}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-100 pt-2">
                      <span className="text-gray-500">Saldo Awal (Kas):</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(shift.openingBalance)}</span>
                    </div>
                    {isClosed && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Saldo Sebenarnya (Kas):</span>
                          <span className="font-bold text-gray-900">{formatCurrency(shift.actualBalance || 0)}</span>
                        </div>
                        {shift.notes && (
                          <div className="bg-gray-50 rounded-lg p-2.5 mt-2 text-xs text-gray-600">
                            <strong>Catatan:</strong> {shift.notes}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ShiftPage;
