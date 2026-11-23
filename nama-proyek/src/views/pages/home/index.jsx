import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getUsers, createUser, updateUser, deleteUser } from '../../../services/userService';

const userSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama lengkap minimal 3 karakter')
    .max(50, 'Nama maksimal 50 karakter'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid (contoh: nama@domain.com)'),
});

export default function HomePage() {
  // Semua urusan input, validasi, dan loading submit ditangani oleh useForm
  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, } = useForm({
    resolver: zodResolver(userSchema),
    mode: 'onBlur',
    defaultValues: { name: '', email: '' },
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // 1. Ambil data awal (GET)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUsers({_limit: 5});
        setUsers(data);
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Isi form otomatis memakai reset() saat tombol Edit diklik
  const handleEditClick = (user) => {
    setEditingId(user.id);
    reset({ name: user.name, email: user.email });
  };

  // Batal edit & kosongkan form
  const handleCancelEdit = () => {
    setEditingId(null);
    reset({ name: '', email: '' });
  };

  // 3. Fungsi ini otomatis dijalankan oleh handleSubmit(onSubmit) jika validasi Zod lolos
  const onSubmit = async (data) => {
    try {
      if (editingId) {
        const updatedUser = await updateUser(editingId, data);
        setUsers((prev) =>
          prev.map((user) => (user.id === editingId ? { ...user, ...updatedUser } : user))
        );
        setEditingId(null);
      } else {
        const createdUser = await createUser(data);
        setUsers((prev) => [createdUser, ...prev]);
      }
      reset({ name: '', email: '' });
    } catch (error) {
      alert('Gagal menyimpan data.');
    }
  };

  // 4. Hapus Data (DELETE)
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));

      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (error) {
      alert('Gagal menghapus pengguna dari server.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p className="p-6 text-slate-500">Memuat data...</p>;

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      {/* Form Tervalidasi Zod + React Hook Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-slate-800">
          {editingId ? 'Edit Pengguna' : 'Tambah Pengguna'}
        </h2>

        <div>
          <input
            type="text"
            placeholder="Nama lengkap"
            className={`w-full border p-2 rounded focus:outline-none ${
              errors.name ? 'border-red-500' : 'border-slate-300 focus:border-blue-500'
            }`}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Alamat email"
            className={`w-full border p-2 rounded focus:outline-none ${
              errors.email ? 'border-red-500' : 'border-slate-300 focus:border-blue-500'
            }`}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 text-white font-medium py-2 rounded transition disabled:bg-slate-400 ${
              editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Kirim Data'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-medium"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Daftar Data */}
      <div>
        <h1 className="text-xl font-bold mb-3 text-slate-800">Daftar Pengguna</h1>
        {users.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">Tidak ada data pengguna.</p>
        ) : (
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="p-3 bg-slate-100 rounded-lg flex justify-between items-center gap-2">
                <div>
                  <p className="font-semibold text-slate-800">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1 rounded font-medium disabled:opacity-50"
                    onClick={() => handleEditClick(user)}
                    disabled={deletingId === user.id}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded font-medium disabled:opacity-50"
                    onClick={() => handleDelete(user.id)}
                    disabled={deletingId === user.id}
                  >
                    {deletingId === user.id ? '...' : 'Hapus'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
