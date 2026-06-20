import React, { useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useOutlets } from '../../hooks/useOutlets';
import { useUIStore } from '../../stores/uiStore';
import { Button, Input, Select, Card } from '../../components/common';
import { User, Lock, Eye, EyeOff, Store, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const { outlets, loading: outletsLoading } = useOutlets();
  const { showToast, setSelectedOutletId } = useUIStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [outletId, setOutletId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !outletId) {
      showToast('Semua field wajib diisi!', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(username, password);
      setSelectedOutletId(outletId);
      showToast('Login berhasil!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal login. Silakan periksa kembali kredensial Anda.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const outletOptions = outlets.map((o) => ({
    value: o.id,
    label: o.name,
  }));

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-gray-50 to-primary-100/30 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        {/* Header/Logo */}
        <div className="text-center mb-8">
          <img src="/logoicon.png" alt="Logo" className="h-20 w-20 mx-auto rounded-2xl shadow-md mb-3 object-contain border border-white/50" />
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Pertama<span className="text-primary-500">Group</span> POS
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sistem Point of Sales Mobile-First & Terintegrasi</p>
        </div>

        {/* Card Form */}
        <Card padding="lg" className="w-full shadow-xl border border-gray-100/50 backdrop-blur-sm bg-white/95">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username atau Email"
              id="username"
              type="text"
              placeholder="Masukkan username atau email Anda"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User className="h-5 w-5 text-gray-400" />}
              required
            />

            <Input
              label="Password"
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-md hover:bg-gray-100 transition-colors duration-150"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
              required
            />

            <div className="space-y-1">
              <label htmlFor="outlet" className="block text-sm font-medium text-gray-700">
                Pilih Outlet Tugas
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Store className="h-5 w-5 text-gray-400" />
                </div>
                <Select
                  id="outlet"
                  options={outletOptions}
                  placeholder={outletsLoading ? 'Memuat outlet...' : 'Pilih Outlet'}
                  value={outletId}
                  onChange={(e) => setOutletId(e.target.value)}
                  className="pl-10"
                  required
                  disabled={outletsLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2 py-3 text-base font-semibold shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 active:scale-[0.98] transition-all duration-150"
              isLoading={isLoading || outletsLoading}
            >
              Masuk ke Sistem
            </Button>
          </form>
        </Card>


      </div>
    </div>
  );
};

export default LoginPage;
