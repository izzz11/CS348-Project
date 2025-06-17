'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  duration: number;
  audio_path: string;
  audio_download_path: string;
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
    cell: info => {
      const genres = info.getValue().split(',').map(g => g.trim());
      return (
        <div className="flex flex-wrap gap-1">
          {genres.map((genre, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium"
            >
              {genre}
            </span>
          ))}
        </div>
      );
    },
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
  const router = useRouter();

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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Head>
        <title>Songs - Music App</title>
        <meta name="description" content="Browse and discover songs" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Song Database
          </h1>
          <Link href="/">
            <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-full transition-colors shadow-sm hover:shadow-md">
              Back to Home
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading songs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="border-b border-gray-100">
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:text-indigo-600"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' ↑',
                          desc: ' ↓',
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
                    onClick={() => router.push(`/play-song/${row.original.sid}`)}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 text-sm text-gray-600">
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