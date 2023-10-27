import { Request, Response } from 'express';
import {prismaClient} from '../db/clientPrisma'; // Import the user model


// Controller to create a new user
export const createUsers = async (req: Request, res: Response) => {
    const { name, email } = req.body;

    try {
        // Check if all required fields are provided
        if (!name || !email) {
            return res.status(400).send({ status: 'error', error: 'Name and email are required fields.' });
        }
        // Check if the username is valid
        if (name.length > 30 || name.length < 2) {
            return res.status(400).send({ status: 'error', error: "Invalid username. It must be between 2 and 30 characters long." });
        }

        // Check if the email is valid
        const emailFormatIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailFormatIsValid) {
            return res.status(400).send({ status: 'error', error: "Invalid email format. Make sure it includes: '@', '.'" });
        }

        // Check if the email already exists in the database
        const emailExist = await prismaClient.user.findUnique({
            where: { email: email },
            include: {
                movies: {
                    select: {
                        id: true,
                        title: true,
                        year: true,
                        language: true,
                        description: true,
                        image: true,
                        genre: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!emailExist) {
            // If we pass all the previous validations, create a new user in the database
            const newUser = await prismaClient.user.create({
                data: { name: name, email: email },
                include: {
                    movies: {
                        select: {
                            id: true,
                            title: true,
                            year: true,
                            language: true,
                            description: true,
                            image: true,
                            genre: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });
            res.status(201).send({ status: 'success', message: "User created successfully!", user: newUser });
        } else {
            // If the email already exists, return the data of the existing user
            return res.status(200).send({ status: 'success', message: 'User already exists.', user: emailExist });
        }
    } catch (err) {
        console.error(err); // Log the error to the console for debugging purposes
        // In case of internal error, return an error message with status code 500
        res.status(500).send({ status: 'error', error: 'Internal server error' });
    }
};

// Controller to get a user by their ID
export const getUserById = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        // Find the user by their ID and populate their "movies" field with movie documents
        const user = await prismaClient.user.findUnique({
            where: { id:userId },
            include: {
                movies: {
                    select: {
                        id: true,
                        title: true,
                        year: true,
                        language: true,
                        description: true,
                        image: true,
                        genre: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            // If the user is not found, return an error message
            return res.status(404).send({ status: 'error', error: "User not found" });
        }

        // If the user is found, return them in the response
        res.status(200).send({ status: 'success', user });
    } catch (err) {
        console.error(err); // Log the error to the console for debugging purposes
        // In case of internal error, return an error message with status code 500
        res.status(500).send({ error: 'Internal server error' });
    }
};

// Controller to get all users
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        // Get all users from the database
        const allUsers = await prismaClient.user.findMany({ include: { movies: { include: { genre: true } } } });

        // Check if there are users in the database
        if (allUsers.length === 0) {
            // If no users are found, return an error message
            return res.status(404).send({ status: 'error', error: "Users not found" });
        }

        // If the user is found, return them in the response
        res.status(200).send({ status: 'success', allUsers });
    } catch (err) {
        console.error(err); // Log the error to the console for debugging purposes
        // In case of internal error, return an error message with status code 500
        res.status(500).send({ status: 'error', error: 'Internal server error' });
    }
};

// Controller to update user data
export const updateUsers = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { name, email } = req.body;

    try {
        // Update the user by their ID and return the updated user
        const userUpdate = await prismaClient.user.update({
            where: {id:userId },
            data: { name, email },
        });

        // Check if the user exists before attempting to update it
        if (!userUpdate) {
            // If the user is not found, return an error message
            return res.status(404).send({ status: 'error', message: 'User not found' });
        }

        // If everything goes well, return a success message with the updated user
        res.status(200).send({ status: 'success', message: 'User updated successfully', user: userUpdate });
    } catch (err) {
        console.error(err); // Log the error to the console for debugging purposes
        // In case of internal error, return an error message with status code 500
        res.status(500).send({ error: 'Internal server error' });
    }
};


// Controller to delete a user
export const deleteUsers = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        // Delete the user by their ID
        const userDelete = await prismaClient.user.delete({ where: {id:userId } });

        // No user was found for deletion, but the deletion is considered successful
        if (!userDelete) {
            return res.status(204).send();
        }

        // Send a successful response with no content
        res.status(204).send({ status: 'success', message: 'User deleted successfully' });
    } catch (err) {
        console.error(err); // Log the error to the console for debugging purposes
        // In case of internal error, return an error message with status code 500
        res.status(500).send({ status: 'error', error: 'Internal server error' });
    }
};