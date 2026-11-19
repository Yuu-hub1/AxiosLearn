import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../../services/userService';

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({ name: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Penanda ID yang sedang dihapus

  // 1. Ambil data awal (GET)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (user) => {
    setEditingId(user.id);
    setFormData({ name: user.name, email: user.email });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '' });
  };

  // 2. Tambah (POST) & Edit (PATCH)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        const updatedUser = await updateUser(editingId, formData);
        setUsers((prev) =>
          prev.map((user) => (user.id === editingId ? { ...user, ...updatedUser } : user))
        );
        setEditingId(null);
      } else {
        const createdUser = await createUser(formData);
        setUsers((prev) => [createdUser, ...prev]);
      }
      setFormData({ name: '', email: '' });
    } catch (error) {
      alert('Gagal menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Hapus Data (DELETE)
  const handleDelete = async (id, name) => {

    setDeletingId(id);

    try {
      await deleteUser(id);
      // Hapus item dari state layar menggunakan .filter()
      setUsers((prev) => prev.filter((user) => user.id !== id));

      // Jika item yang dihapus sedang dalam mode edit, reset formnya
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
      {/* Form Dinamis (POST & PATCH) */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-slate-800">
          {editingId ? 'Edit Pengguna' : 'Tambah Pengguna'}
        </h2>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nama lengkap"
          className="w-full border border-slate-300 p-2 rounded focus:outline-blue-500"
          required
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Alamat email"
          className="w-full border border-slate-300 p-2 rounded focus:outline-blue-500"
          required
        />

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
                  <button className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1 rounded font-medium disabled:opacity-50"
                    onClick={() => handleEditClick(user)}
                    disabled={deletingId === user.id}
                  >
                    Edit
                  </button>
                  <button className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded font-medium disabled:opacity-50"
                    onClick={() => handleDelete(user.id, user.name)}
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
