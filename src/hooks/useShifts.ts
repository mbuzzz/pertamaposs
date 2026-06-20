import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Shift, ShiftNumber } from '../types';
import { User } from '../types';

export function useShifts(profile: User | null) {
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('shifts')
      .select('*')
      .order('opened_at', { ascending: false });
    if (data) {
      setShifts(data.map(mapShift));
      const open = data.find((s: any) => s.status === 'open');
      setActiveShift(open ? mapShift(open) : null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

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

  async function openShift(shiftNumber: ShiftNumber, openingBalance: number, notes?: string) {
    if (!profile) return;
    const { data } = await supabase.from('shifts').insert({
      shift_number: shiftNumber,
      kasir_id: profile.id,
      kasir_name: profile.name,
      outlet_id: profile.outletId,
      opening_balance: openingBalance,
      notes,
      status: 'open',
    }).select().single();
    if (data) {
      setActiveShift(mapShift(data));
      fetch();
    }
  }

  async function closeShift(actualBalance: number, notes?: string) {
    if (!activeShift) return;
    const closingBalance = activeShift.openingBalance;
    const variance = actualBalance - closingBalance;
    await supabase.from('shifts').update({
      closing_balance: closingBalance,
      actual_balance: actualBalance,
      variance,
      closed_at: new Date().toISOString(),
      notes,
      status: 'closed',
    }).eq('id', activeShift.id);
    setActiveShift(null);
    fetch();
  }

  async function deleteShift(id: string) {
    await supabase.from('shifts').delete().eq('id', id);
    fetch();
  }

  return { activeShift, shifts, loading, openShift, closeShift, deleteShift, refetch: fetch };
}
