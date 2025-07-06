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
  getPaginationRowModel,
} from '@tanstack/react-table';
import axios from 'axios';
// @ts-ignore
import { MagnifyingGlassIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/songs/fetch_all');
        setSongs(response.data);
        setFilteredSongs(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch songs. Please try again later.');
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  // Filter songs when search changes
  useEffect(() => {
    if (!search.trim()) {
      setFilteredSongs(songs);
    } else {
      const lower = search.toLowerCase();
      setFilteredSongs(
        songs.filter(song =>
          song.name.toLowerCase().includes(lower) ||
          song.artist.toLowerCase().includes(lower) ||
          song.genre.toLowerCase().includes(lower)
        )
      );
    }
  }, [search, songs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filtering is handled by useEffect
  };

  const handleClear = () => {
    setSearch('');
  };

  const table = useReactTable({
    data: filteredSongs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Head>
        <title>Songs - Music App</title>
        <meta name="description" content="Browse and discover songs" />
      </Head>
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Song Database</h1>
          
        </div>
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search by song, artist, or genre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition text-gray-700 bg-white shadow-sm"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            {search && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500 focus:outline-none"
                aria-label="Clear search"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-full transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Search
          </button>
        </form>
        {/* Song Count */}
        <div className="mb-4 text-sm text-gray-500">
          Showing {filteredSongs.length} of {songs.length} songs
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading songs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-lg font-medium">
            No results found.
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="border-b border-gray-100">
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:text-indigo-600 select-none"
                          onClick={header.column.getToggleSortingHandler?.()}
                          tabIndex={0}
                          onKeyDown={e => {
                            const handler = header.column.getToggleSortingHandler?.();
                            if (e.key === 'Enter' && handler) handler(e);
                          }}
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
                      className="border-b border-gray-50 hover:bg-indigo-50 transition-colors cursor-pointer group"
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-4 py-3 text-sm text-gray-600 group-hover:text-indigo-700 transition-colors">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  filteredSongs.length
                )}{' '}
                of {filteredSongs.length} results
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: table.getPageCount() }, (_, i) => {
                    const pageIndex = i;
                    const isCurrentPage = pageIndex === table.getState().pagination.pageIndex;
                    
                    // Show first page, last page, current page, and pages around current
                    const shouldShow = 
                      pageIndex === 0 ||
                      pageIndex === table.getPageCount() - 1 ||
                      Math.abs(pageIndex - table.getState().pagination.pageIndex) <= 1;
                    
                    if (!shouldShow) {
                      // Show ellipsis if there's a gap
                      const prevPage = pageIndex - 1;
                      const nextPage = pageIndex + 1;
                      const shouldShowEllipsis = 
                        prevPage > 0 && 
                        nextPage < table.getPageCount() - 1 &&
                        Math.abs(prevPage - table.getState().pagination.pageIndex) > 1 &&
                        Math.abs(nextPage - table.getState().pagination.pageIndex) > 1;
                      
                      if (shouldShowEllipsis && pageIndex === prevPage + 1) {
                        return (
                          <span key={`ellipsis-${pageIndex}`} className="px-2 py-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                    
                    return (
                      <button
                        key={pageIndex}
                        onClick={() => table.setPageIndex(pageIndex)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isCurrentPage
                            ? 'bg-indigo-500 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        {pageIndex + 1}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
} 