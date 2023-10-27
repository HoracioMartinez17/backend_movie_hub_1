import { Request, Response } from "express";
import {prismaClient} from "../db/clientPrisma";


// Create a new genre
export const createGenre = async (req: Request, res: Response) => {
    const { name } = req.body;

    try {
        // Check if the genre already exists
        const existingGenre = await prismaClient.genres.findFirst({ where: { name } });

        if (existingGenre) {
            return res.status(400).send({ error: 'Genre already exists' });
        }

        // Create a new genre
        const newGenre = await prismaClient.genres.create({ data: { name } });

        res.status(201).send({ status: 'success', message: 'Genre created successfully', newGenre });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
};

// Get movies by genre and user
export const getMoviesByGenreAndUser = async (req: Request, res: Response) => {
    const { genreName, userId } = req.params;
    const pageSize = 4; // Number of movies per page
    const currentPage = req.query.page ? parseInt(req.query.page.toString()) : 1; // Current page
    try {
        const skip = (currentPage - 1) * pageSize;

        const genre = await prismaClient.genres.findFirst({
            where: { name: genreName },
            include: {
                movies: {
                    where: { userId},
                    skip: skip,
                    take: pageSize,
                    include: {
                        genre: {
                            select: {
                                name: true
                            }
                        },
                        image: {
                            select: {
                                secure_url: true,
                                public_id: true
                            }
                        }
                    }
                }
            }
        });

        if (!genre) {
            return res.status(404).send({ status: 'error', error: "Genre not found" });
        }

        const totalMovies = await prismaClient.movies.count({ where: { genreId: genre.id, userId } });
        const totalPages = Math.ceil(totalMovies / pageSize);

        res.status(200).send({
            status: 'success',
            movies: genre.movies,
            pagination: {
                currentPage,
                pageSize,
                totalMovies,
                totalPages
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: 'error', error: 'An error occurred' });
    }
};

// Get all genres
export const getAllGenres = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {

        const allGenres = await prismaClient.genres.findMany({
            include: {
                movies: {
                    where: { userId },
                    select: {
                        id: true,
                        title: true,
                        year: true,
                        language: true,
                        description: true,
                        image: true,
                    }
                }
            }
        })

        res.status(201).send(allGenres)

    } catch (error) {
        res.status(500).send(error)
    }
}

// Update a genre's name
export const updateGenre = async (req: Request, res: Response) => {
    const { id } = req.params; // Genre ID to be updated
    const { name } = req.body; // New name for the genre

    try {
        // Find the genre by its ID and update its name
        const updatedGenre = await prismaClient.genres.update({
            where: { id:  id },
            data: { name }
        });

        // Check if the genre was updated
        if (!updatedGenre) {
            return res.status(404).send({ status: 'error', message: 'Genre not found' });
        }

        // Send a successful response with the updated genre
        res.status(200).send({ status: 'success', message: 'Genre updated successfully', updatedGenre });
    } catch (err) {
        console.error(err); // Log the error to the console for debugging purposes
        // In case of an internal error, return an error message with status code 500
        res.status(500).send({ error: 'Internal server error' });
    }
};

// delete genre
export const deleteGenre = async (req: Request, res: Response) => {
    const { id } = req.params; // Genre ID to be deleted

    try {
        // Find the genre by its ID and delete it
        const deletedGenre = await prismaClient.genres.delete({
            where: { id: id }
        });

        // Check if the genre was deleted
        if (!deletedGenre) {
            return res.status(404).send({ status: 'error', message: 'Genre not found' });
        }

        // Send a successful response with no content
        res.status(204).send({ status: 'success', message: 'Genre deleted successfully' });
    } catch (err) {
        console.error(err); // Log the error to the console for debugging purposes
        // In case of an internal error, return an error message with status code 500
        res.status(500).send({ error: 'Internal server error' });
    }
};