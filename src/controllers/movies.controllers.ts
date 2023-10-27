import { Request, Response } from 'express';
import {prismaClient} from '../db/clientPrisma';
import { uploadImage } from '../utils/cloudinary';
import fs from 'fs-extra';


// Controller to create a new movie
export const createMovie = async (req: Request, res: Response) => {
    let { title, year, description, language, genre } = req.body;
    const { userId } = req.params;

    let secure_url_image: string = '';
    let public_id_image: string = '';

    try {
        const uploadedImage = req.files?.image;

        // Check if uploadedImage exists and is not an array
        if (uploadedImage === undefined || Array.isArray(uploadedImage)) {
            console.log('Invalid or missing image');
            return res.status(400).json('Invalid or missing image');
        }

        // Check if 'tempFilePath' is present in uploadedImage
        if (!('tempFilePath' in uploadedImage)) {
            console.log('Missing tempFilePath');
            return res.status(400).send('Missing tempFilePath');
        }

        // Upload the image to Cloudinary
        const image = await uploadImage(uploadedImage.tempFilePath);
        public_id_image = image.public_id;
        secure_url_image = image.secure_url;

        // Delete the temporary file
        await fs.unlink(uploadedImage.tempFilePath);

        // Create a new instance of the movie with the provided data
        const newMovie = await prismaClient.movies.create({
            data: {
                title,
                year,
                description,
                language,
                image: {
                    create: {
                        public_id: public_id_image,
                        secure_url: secure_url_image,
                    },
                },
                genre: {
                    connect: { id: genre },
                },
                User: {
                    connect: {
                        id:userId ,
                    },
                },
            },
            select: {
                title: true,
                year: true,
                description: true,
                language: true,
                image: {
                    select: {
                        public_id: true,
                        secure_url: true,
                    },
                },
                genre: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Send the saved movie as a response
        res.status(201).send({ status: 'success', message: 'Movie created successfully', newMovie });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
};

// Controller to update movies with an image
export const updateMovieWithImage = async (req: Request, res: Response) => {
    const { movieId } = req.params;
    const { title, description, language, year, genre } = req.body;

    try {
        // Get the existing movie by its ID
        const existingMovie = await prismaClient.movies.findUnique({
            where: { id: movieId  },
        });

        // If the movie was not found, return a 404 error
        if (!existingMovie) {
            return res.status(404).send({ status: 'error', message: 'Movie not found' });
        }

        // Create a data object with the fields provided in the request
        const updatedData: any = {}; // Define the necessary properties and their types

        if (title !== undefined) {
            updatedData.title = title;
        }

        if (description !== undefined) {
            updatedData.description = description;
        }

        if (language !== undefined) {
            updatedData.language = language;
        }

        if (year !== undefined) {
            updatedData.year = year;
        }

        if (genre !== undefined) {
            updatedData.genre = { connect: { id: genre } };
        }

        // Update the movie with the provided fields
        const updatedMovie = await prismaClient.movies.update({
            where: { id: movieId  },
            data: updatedData,
        });

        // Load the new image (if provided) and update the image reference in the database
        const uploadedImage = req.files?.image;
        if (uploadedImage && 'tempFilePath' in uploadedImage) {
            try {
                // Upload the new image
                const posterImage = await uploadImage(uploadedImage.tempFilePath);

                // Update the image reference in the database
                await prismaClient.movies.update({
                    where: { id: movieId },
                    data: {
                        image: {
                            update: {
                                public_id: posterImage.public_id,
                                secure_url: posterImage.secure_url,
                            },
                        },
                    },
                });

                // Delete the temporary file of the new image
                await fs.unlink(uploadedImage.tempFilePath);
            } catch (error) {
                return res.status(500).json({ error: 'Upload error' });
            }
        }

        // Return a 200 response indicating a successful update
        res.status(200).send({ status: 'success', message: 'Movie updated successfully', updatedMovie });
    } catch (err) {
        console.error(err); // Log the error to the console for debugging purposes
        // In case of an internal error, return an error message with status code 500
        res.status(500).send({ error: 'Internal server error' });
    }
};



// Controller to get movies by their ID
export const getMoviesByMovieId = async (req: Request, res: Response) => {
    const { movieId } = req.params;

    try {
        // Find the movie in the database by its ID
        const movie = await prismaClient.movies.findUnique({
            where: {id: movieId  },
            select: {
                id: true,
                title: true,
                year: true,
                language: true,
                description: true,
                image: true,
                genre: {
                    select: {
                        name: true,
                    },
                },
            }
        });
        if (!movie) {
            // If the movie is not found, return an error message with status code 404
            return res.status(404).send({ status: 'error', error: 'Movie not found' });
        }

        // Return the array of movies
        res.status(200).send({ status: 'success', movie });
    } catch (err) {
        console.error(err); // Log the error to the console for debugging purposes
        // In case of internal error, return an error message with status code 500
        res.status(500).send({ status: 'error', error: 'Internal server error' });
    }
};

// Controller to get all movies
export const getAllMovies = async (req: Request, res: Response) => {
    const pageSize = 4; // Number of movies per page
    const currentPage = req.query.page ? parseInt(req.query.page.toString()) : 1; // Current page

    try {
        // Calculate the start index to skip records
        const skip = (currentPage - 1) * pageSize;

        // Search for movies in the database with pagination and selected fields
        const movies = await prismaClient.movies.findMany({
            skip,
            take: pageSize,
            select: {
                title: true,
                year: true,
                description: true,
                language: true,
                image: true,
                genre: true,
            },
        });

        // Count all movies to calculate the total pages
        const totalMovies = await prismaClient.movies.count();

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalMovies / pageSize);

        // Return the list of movies and pagination information
        res.status(200).send({
            status: 'success',
            data: movies,
            pagination: {
                currentPage,
                pageSize,
                totalMovies,
                totalPages,
            },
        });
    } catch (err) {
        console.error(err);
        // In case of internal error, return an error message with status code 500
        res.status(500).send({ status: 'error', error: 'Internal server error' });
    }
};

// Controller to delete a movie
export const deleteMovie = async (req: Request, res: Response) => {
    const { movieId } = req.params; // ID of the movie to be deleted

    try {
        // Find the movie by its ID and delete it
        const deletedMovie = await prismaClient.movies.delete({ where:{ id:movieId} });

        // Check if the movie was deleted
        if (!deletedMovie) {
            return res.status(404).send({ status: 'error', message: 'Movie not found' });
        }

        // Send a successful response with no content
        res.status(204).send({ status: 'success', message: 'Movie deleted successfully' });
    } catch (err) {
        console.error(err); // Log the error to the console for debugging purposes
        // In case of internal error, return an error message with status code 500
        res.status(500).send({ error: 'Internal server error' });
    }
};

// Movie creation model
// {
//     "title": "Movie Title",
//     "year": 2023,
//     "description": "Movie Description",
//     "language": "Movie Language",
//     "image": "Image URL",
//     "genre": "ID of the genre to which you want to relate the movie"
// }
