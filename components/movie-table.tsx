"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Info, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import moment from "moment-timezone";
import "moment/locale/pt-br";
import {getStorage, setStorage} from "@/utils/storage";

moment.locale("pt-br");

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  genre_ids: number[];
  release_date: string;
  overview: string;
}

export interface MovieStorage {
  id: number;
  title: string;
  updated_at: string; // formato de data como string
  isDubbed: boolean;
}



interface MovieTableProps {
  movies: Movie[];
  genres: { [key: number]: string };
}

const TMDB_IMG_URL = "https://image.tmdb.org/t/p/w500";
export const STORAGE_MOVIES_DONE = "movies_1"

export function MovieTable({ movies, genres }: MovieTableProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [checkedMovies, setCheckedMovies] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [dubbedStatus, setDubbedStatus] = useState<{ [key: number]: boolean }>(
    {}
  );

  const loadCheckedMovies = () => {
    const newCheckedMovies: { [key: number]: boolean } = {};
    const newDubbedStatus: { [key: number]: boolean } = {};

    const cachedMovies: Array<Movie | null> = getStorage(STORAGE_MOVIES_DONE);

    if (cachedMovies && cachedMovies?.length > 0) {
      cachedMovies.forEach((item: any) => {
        newCheckedMovies[item.id] = true;
        newDubbedStatus[item.id] = item.isDubbed;
      })
    }

    setCheckedMovies(newCheckedMovies);
    setDubbedStatus(newDubbedStatus);
  };



  const handleMovieCheck = (movie: Movie, checked: boolean) => {
    const newCheckedMovies = { ...checkedMovies };
    const cachedMoviesDone = getStorage(STORAGE_MOVIES_DONE);

    const movieData = {
      id: movie.id,
      title: movie.title,
      updated_at: moment().tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm:ss"),
      isDubbed: dubbedStatus[movie.id] || false,
    };

    if (cachedMoviesDone && cachedMoviesDone?.length > 0) {
      const index = cachedMoviesDone.findIndex((item: any) => item.id === movieData.id);
      if (index !== -1) {
        cachedMoviesDone.splice(index, 1);
      } else {
        cachedMoviesDone.unshift(movieData);
      }
      setStorage(STORAGE_MOVIES_DONE, cachedMoviesDone);
    } else {
      setStorage(STORAGE_MOVIES_DONE, [movieData]);
    }

    if (checked) {
      newCheckedMovies[movie.id] = true;
    } else {
      delete newCheckedMovies[movie.id];
    }
    console.log(newCheckedMovies)
    setCheckedMovies({...newCheckedMovies});
  };

  const handleDubbedChange = (movieId: number, isDubbed: boolean) => {
    const cachedMoviesDone: Array<MovieStorage> = getStorage(STORAGE_MOVIES_DONE);
    const newDubbedStatus = { ...dubbedStatus };
    newDubbedStatus[movieId] = isDubbed;
    setDubbedStatus(newDubbedStatus);

    if (checkedMovies[movieId]) {
      const index = cachedMoviesDone.findIndex((item) => item.id === movieId);
      if (index !== -1) {
        cachedMoviesDone[index].isDubbed = isDubbed;
      }
      setStorage(STORAGE_MOVIES_DONE, cachedMoviesDone);
    }
  };

  const getGenres = (genreIds: number[]) => {
    return genreIds.map((id) => genres[id]).filter(Boolean);
  };

  useEffect(() => {
    loadCheckedMovies();
  }, []);
  return (
    <>
      <div className="rounded-md border">

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Categorias</TableHead>
              <TableHead>Data de Lançamento</TableHead>
              {/*<TableHead>Dublado</TableHead>*/}
              <TableHead>Ver detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movies.map((movie) => (
              <TableRow key={movie.id}>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <Checkbox
                        checked={checkedMovies[movie.id] || false}
                        onCheckedChange={(checked) =>
                          handleMovieCheck(movie, checked as boolean)
                        }
                        className="h-6 w-6 rounded-full border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      {/*{checkedMovies[movie.id] && (*/}
                      {/*  <Check className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-white" />*/}
                      {/*)}*/}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={
                        movie.poster_path
                          ? `${TMDB_IMG_URL}${movie.poster_path}`
                          : "/placeholder.png"
                      }
                      alt={movie.title}
                      className="h-24 w-16 object-cover rounded"
                    />
                    <span className="font-medium" style={{maxWidth:200}}>{movie.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1" style={{maxWidth:300}}>
                    {getGenres(movie.genre_ids).map((genre, index) => (
                      <Badge key={index} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {moment(movie.release_date).format("DD/MM/YYYY")}
                </TableCell>
                {/*<TableCell>*/}
                {/*  <Switch*/}
                {/*    checked={dubbedStatus[movie.id] || false}*/}
                {/*    disabled={!checkedMovies[movie.id]}*/}
                {/*    onCheckedChange={(checked) =>*/}
                {/*      handleDubbedChange(movie.id, checked)*/}
                {/*    }*/}
                {/*  />*/}
                {/*</TableCell>*/}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedMovie(movie)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {movies.length === 0 && <div className={"my-10 text-center"}><h1 className={"text-2xl"}>Digite para buscar</h1></div>}
      </div>

      <Dialog open={!!selectedMovie} onOpenChange={() => setSelectedMovie(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMovie?.title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {selectedMovie?.poster_path && (
              <img
                src={`${TMDB_IMG_URL}${selectedMovie.poster_path}`}
                alt={selectedMovie.title}
                className="w-[200px] mx-auto rounded-lg"
              />
            )}
            <div className="flex flex-wrap gap-2">
              {selectedMovie?.genre_ids.map((genreId) => (
                <Badge key={genreId} variant="outline">
                  {genres[genreId]}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedMovie?.overview}
            </p>
            <p className="text-sm">
              Data de Lançamento:{" "}
              {moment(selectedMovie?.release_date).format("DD [de] MMMM [de] YYYY")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}