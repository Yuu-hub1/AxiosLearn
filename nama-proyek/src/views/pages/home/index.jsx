import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getUsers, createUser, updateUser, deleteUser } from '../../../services/userService';
import { useDebounce } from '../../shared/hooks/useDebounce';

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
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(userSchema),
    mode: 'onBlur',
    defaultValues: { name: '', email: '' },
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // State Pencarian (Debounce + Submit)
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500); // Diubah ke 500ms agar lebih responsif

  // State Filtering (Kategori Kota)
  const [selectedCity, setSelectedCity] = useState('ALL');

  // Sinkronkan hasil debounce ke activeQuery secara otomatis
  useEffect(() => {
    setActiveQuery(debouncedSearch);
  }, [debouncedSearch]);

  // 1. Ambil data dari API setiap kali activeQuery berubah
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = activeQuery ? { q: activeQuery } : {};
        const data = await getUsers(params);
        setUsers(data);
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeQuery]);

  // Ekstrak daftar kota unik dari data users untuk isi dropdown
  const uniqueCities = ['ALL', ...new Set(users.map((u) => u.address?.city).filter(Boolean))];

  // Saring data berdasarkan kota yang dipilih (Client-side Filtering)
  const filteredUsers = users.filter((user) => {
    if (selectedCity === 'ALL') return true;
    return user.address?.city === selectedCity;
  });

  // Trigger langsung saat Enter / tombol Cari ditekan
  const handleSearch = (e) => {
    e.preventDefault();
    setActiveQuery(searchTerm);
  };

  // Reset pencarian & filter sekaligus
  const handleResetAll = () => {
    setSearchTerm('');
    setActiveQuery('');
    setSelectedCity('ALL');
  };

  const handleEditClick = (user) => {
    setEditingId(user.id);
    reset({ name: user.name, email: user.email });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset({ name: '', email: '' });
  };

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

  const isFilterActive = searchTerm !== '' || selectedCity !== 'ALL';

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
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
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
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
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

      {/* Baris Pencarian & Filter Kota */}
      <div className="space-y-2">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari pengguna..."
            className="flex-1 border border-slate-300 p-2 rounded-lg focus:outline-blue-500"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            Cari
          </button>
        </form>

        <div className="flex items-center justify-between gap-2">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="flex-1 border border-slate-300 p-2 rounded-lg bg-white text-sm text-slate-700 focus:outline-blue-500"
          >
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city === 'ALL' ? 'Filter: Semua Kota' : `Kota: ${city}`}
              </option>
            ))}
          </select>

          {isFilterActive && (
            <button
              type="button"
              onClick={handleResetAll}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Daftar Data (Menggunakan filteredUsers) */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold text-slate-800">Daftar Pengguna</h1>
          <span className="text-xs text-slate-500">
            {filteredUsers.length} data
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Memuat data...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">Tidak ada data pengguna yang cocok.</p>
        ) : (
          <ul className="space-y-2">
            {filteredUsers.map((user) => (
              <li key={user.id} className="p-3 bg-slate-100 rounded-lg flex justify-between items-center gap-2">
                <div>
                  <p className="font-semibold text-slate-800">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  {user.address?.city && (
                    <span className="inline-block mt-1 text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                      {user.address.city}
                    </span>
                  )}
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
