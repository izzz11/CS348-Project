import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import axios from 'axios';

// Define the type for our song data
type Song = {
  sid: number;
  name: string;
  genre: string;
  artist: string;
  year: number;
  language: string;
  duration: number;
  other_info: string;
};

const columnHelper = createColumnHelper<Song>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Song Name',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('artist', {
    header: 'Artist',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('genre', {
    header: 'Genre',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('year', {
    header: 'Year',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('language', {
    header: 'Language',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('duration', {
    header: 'Duration (min)',
    cell: info => (info.getValue() / 60).toFixed(2),
  }),
];

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/songs/fetch_all');
        setSongs(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch songs. Please try again later.');
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const table = useReactTable({
    data: songs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>Songs - Music App</title>
        <meta name="description" content="Browse and discover songs" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Song Database
          </h1>
          <Link href="/">
            <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
              Back to Home
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4">Loading songs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto bg-gray-800/80 rounded-xl shadow-lg">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="border-b border-gray-700">
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-purple-400"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
} 