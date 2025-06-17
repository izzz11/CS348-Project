"use client";

import MusicInterface from "@/components/songs/PlaySong";
import { useParams } from "next/navigation";

export default function PlaySongPage() {
  const params = useParams();
  const slug = params?.song as string;

  return <MusicInterface songId={slug}/>;
}