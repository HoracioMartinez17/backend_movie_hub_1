import {Router} from "express";
import {createGenre, getAllGenres,getMoviesByGenreAndUser, deleteGenre,updateGenre } from "../controllers/genre.controllers";

const GenreRouter = Router()

GenreRouter
    .post("/", createGenre)
    .put("/:genreName/:id", updateGenre )
    .get("/:genreName/:userId", getMoviesByGenreAndUser )
    .get("/:userId", getAllGenres)
    .delete("/:genreName/:id", deleteGenre )


export default GenreRouter
