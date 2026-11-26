import { useState, useEffect, useMemo } from 'react';
import { getUsers } from '../../services/userService';
import { useDebounce } from '../shared/hooks/useDebounce';

export default function Features() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 2000);

  const [queryParams, setQueryParams] = useState({
    search: '',
    city: 'ALL',
    sort: 'DEFAULT',
    page: 1,
    limit: 3,
  });

  useEffect(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: debouncedSearch,
      page: 1,
    }));
  }, [debouncedSearch]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = queryParams.search ? { q: queryParams.search } : {};
        const data = await getUsers(params);
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [queryParams.search]);

  const uniqueCities = useMemo(() => {
    return ['ALL', ...new Set(users.map((u) => u.address?.city).filter(Boolean))];
  }, [users]);

  const { paginatedUsers, totalPages, totalItems } = useMemo(() => {
    const filtered = users.filter(
      (u) => queryParams.city === 'ALL' || u.address?.city === queryParams.city
    );

    const sorted = [...filtered].sort((a, b) => {
      if (queryParams.sort === 'ASC') return a.name.localeCompare(b.name);
      if (queryParams.sort === 'DESC') return b.name.localeCompare(a.name);
      return 0;
    });

    const totalItems = sorted.length;
    const totalPages = Math.ceil(totalItems / queryParams.limit);
    const start = (queryParams.page - 1) * queryParams.limit;
    const paginatedUsers = sorted.slice(start, start + queryParams.limit);

    return { paginatedUsers, totalPages, totalItems };
  }, [users, queryParams]);

  const updateFilter = (key, value) => {
    setQueryParams((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const changePage = (newPage) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter('search', searchTerm);
  };

  const handleReset = () => {
    setSearchTerm('');
    setQueryParams({ search: '', city: 'ALL', sort: 'DEFAULT', page: 1, limit: 3 });
  };

  const isFiltered =
    searchTerm !== '' || queryParams.city !== 'ALL' || queryParams.sort !== 'DEFAULT';

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">Direktori Pengguna</h1>
        <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-600">
          {totalItems} hasil
        </span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama pengguna..."
          className="flex-1 border border-slate-300 px-3 py-2 rounded-lg text-sm focus:outline-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Cari
        </button>
      </form>

      <div className="flex gap-2">
        <select
          value={queryParams.city}
          onChange={(e) => updateFilter('city', e.target.value)}
          className="flex-1 border border-slate-300 px-3 py-2 rounded-lg bg-white text-sm text-slate-700 focus:outline-blue-500"
        >
          {uniqueCities.map((city) => (
            <option key={city} value={city}>
              {city === 'ALL' ? 'Semua Kota' : city}
            </option>
          ))}
        </select>

        <select
          value={queryParams.sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="flex-1 border border-slate-300 px-3 py-2 rounded-lg bg-white text-sm text-slate-700 focus:outline-blue-500"
        >
          <option value="DEFAULT">Urutan Default</option>
          <option value="ASC">Nama (A - Z)</option>
          <option value="DESC">Nama (Z - A)</option>
        </select>

        {isFiltered && (
          <button
            type="button"
            onClick={handleReset}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium"
          >
            Reset
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 py-6 text-center">Memuat data...</p>
      ) : paginatedUsers.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 text-center bg-slate-50 rounded-lg border border-dashed">
          Data tidak ditemukan.
        </p>
      ) : (
        <ul className="space-y-2">
          {paginatedUsers.map((user) => (
            <li
              key={user.id}
              className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium">
                {user.address?.city}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => changePage(Math.max(queryParams.page - 1, 1))}
            disabled={queryParams.page === 1}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40"
          >
            Prev
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => changePage(page)}
                className={`w-7 h-7 text-xs rounded-lg font-medium ${
                  queryParams.page === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => changePage(Math.min(queryParams.page + 1, totalPages))}
            disabled={queryParams.page === totalPages}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
