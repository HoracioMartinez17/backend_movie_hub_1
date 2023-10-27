/**
 * Middleware for converting and validating movie fields in the request body.
 * - Converts non-string values to strings.
 * - Converts the title to lowercase.
 * - Converts the genre name to lowercase.
 * - Instead of throwing an error, a better practice is to attempt to convert data to the correct format when possible,
 * - instead of rejecting the request altogether.
 * - This approach tries to convert data to the correct format whenever possible,
 * - allowing for a more flexible user experience and avoiding unnecessary request rejections.
 */
import { Request, Response, NextFunction } from 'express';

export const convertMovieFields = (req: Request, res: Response, next: NextFunction) => {
    const { title, year, description, language, genre } = req.body;

    // Validate that all required fields are provided
    if (!title || !year || !genre || !language || !description ) {
        return res.status(400).send({ error: 'Please provide all required fields' });
    }

    // Convert the year to a number if it's a string
    if (typeof year == 'string') {
        req.body.year = parseInt(year);
    }

    // Validate that the language is a string
    if (typeof language !== 'string') {
        return res.status(400).send({ status: 'error', error: 'Language must be a string' });
    }

    // Convert the title to a string if it's a number
    if (typeof title === 'number') {
        req.body.title = title.toString();
    }

    // Convert the title to lowercase if it's a string
    if (typeof title === 'string') {
        req.body.title = title.toLowerCase();
    }

    // Convert the genre to lowercase
    if (typeof genre === 'string') {
        req.body.genre = genre.toLowerCase();
    }

    // Convert the description to a string if it's a number
    if (typeof description === 'number') {
        req.body.description = description.toString();
    }

    // Pass control to the next middleware
    next();
};
