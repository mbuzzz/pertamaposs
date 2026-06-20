import React from 'react';
import { Card, Button } from '../components/common';
import { Frown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full text-center py-12 px-6 flex flex-col items-center">
        <Frown className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">404 - Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 text-sm mt-2 mb-6">
          Maaf, halaman yang Anda cari tidak dapat ditemukan.
        </p>
        <Button onClick={() => navigate('/')} className="w-full">
          Kembali ke Dashboard
        </Button>
      </Card>
    </div>
  );
};
export default NotFoundPage;
