import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Outlet } from '../types';

export function useOutlets() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('outlets').select('*').order('name');
    if (data) {
      setOutlets(data.map((o: any) => ({
        id: o.id,
        name: o.name,
        address: o.address || '',
        phone: o.phone || '',
        isActive: o.is_active,
        invoiceHeader: o.invoice_header || '',
        invoiceFooter: o.invoice_footer || '',
        createdAt: o.created_at,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function addOutlet(outlet: Omit<Outlet, 'id' | 'createdAt'>) {
    const { data } = await supabase.from('outlets').insert({
      name: outlet.name,
      address: outlet.address,
      phone: outlet.phone,
      is_active: outlet.isActive,
      invoice_header: outlet.invoiceHeader,
      invoice_footer: outlet.invoiceFooter,
    }).select().single();
    if (data) fetch();
    return data;
  }

  async function updateOutlet(outlet: Outlet) {
    await supabase.from('outlets').update({
      name: outlet.name,
      address: outlet.address,
      phone: outlet.phone,
      is_active: outlet.isActive,
      invoice_header: outlet.invoiceHeader,
      invoice_footer: outlet.invoiceFooter,
    }).eq('id', outlet.id);
    fetch();
  }

  async function deleteOutlet(id: string) {
    await supabase.from('outlets').delete().eq('id', id);
    fetch();
  }

  return { outlets, loading, addOutlet, updateOutlet, deleteOutlet, refetch: fetch };
}
