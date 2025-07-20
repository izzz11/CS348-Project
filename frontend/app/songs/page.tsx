'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel,
} from '@tanstack/react-table';
import axios from 'axios';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../lib/AuthContext';

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
      const genres = info.getValue().split(/[;,]/).map(g => g.trim());
      return (
        <div className="flex flex-wrap gap-1">
          {genres.map((g, i) => (
            <span
              key={i}
              className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium"
            >
              {g}
            </span>
          ))}
        </div>
      );
    },
  }),
  columnHelper.accessor('duration', {
    header: 'Duration',
    cell: info => {
      const secs = info.getValue();
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    },
  }),
];

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controlled search input vs. committed query
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 20;

  const router = useRouter();
  const { user } = useAuth();

  // Fetch page whenever pageIndex or searchQuery changes
  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      try {
        const resp = await axios.get('http://localhost:8000/songs/fetch_paginated', {
          params: {
            page: pageIndex + 1,
            page_size: pageSize,
            search: searchQuery || undefined,
          },
        });
        setSongs(resp.data);
        setError(null);
      } catch {
        setError('Failed to fetch songs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, [pageIndex, searchQuery]);

  // Commit the searchTerm on form submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(0);
    setSearchQuery(searchTerm.trim());
  };

  // Clear both input and query
  const handleClear = () => {
    setSearchTerm('');
    setSearchQuery('');
    setPageIndex(0);
  };

  const table = useReactTable({
    data: songs,
    columns,
    pageCount: -1, // unknown total
    state: {
      pagination: { pageIndex, pageSize },
    },
    manualPagination: true,
    onPaginationChange: updater => {
      const next = typeof updater === 'function'
        ? updater({ pageIndex, pageSize })
        : updater;
      setPageIndex(next.pageIndex);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Head>
        <title>Songs – Music App</title>
        <meta name="description" content="Browse and search songs" />
      </Head>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Song Database</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by song, artist, or genre…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500"
                aria-label="Clear search"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600"
          >
            Search
          </button>
        </form>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading…</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : songs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No songs found.</div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id} className="border-b">
                      {hg.headers.map(h => (
                        <th
                          key={h.id}
                          className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
                          onClick={h.column.getToggleSortingHandler?.()}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {{
                            asc: ' ↑',
                            desc: ' ↓',
                          }[h.column.getIsSorted() as string] ?? null}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(r => (
                    <tr
                      key={r.id}
                      onClick={() => router.push(`/play-song/${r.original.sid}`)}
                      className="border-b hover:bg-indigo-50 cursor-pointer"
                    >
                      {r.getVisibleCells().map(c => (
                        <td key={c.id} className="px-4 py-3">
                          {flexRender(c.column.columnDef.cell, c.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">Page {pageIndex + 1}</span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
