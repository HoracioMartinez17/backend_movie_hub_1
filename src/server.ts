import express, { Express,Response } from 'express';
import UserRouter from './routes/user.routes';
import MoviesRouter from './routes/movies.routes';
import morgan from 'morgan';
import cors from 'cors';
import GenreRouter from './routes/genre.routes';
import errorHandler from './middlewares/error.middleware';
import fileUpload from 'express-fileupload';

// Initialize the Express application
const app: Express = express();

// Configure middlewares
app.use(express.json()); // Middleware for handling JSON in requests
app.use(morgan('dev')); // Middleware for request logging in the console
app.use(cors()); // Middleware for enabling CORS (Cross-Origin Resource Sharing)
app.use(express.urlencoded({ extended: false })); // Middleware for parsing form data
// Configure express-fileupload
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads"
}));
app.use(errorHandler); // Middleware for handling errors

// Configure routes
app.use('/user', UserRouter); // Use the user router at the /user route
app.use('/movies', MoviesRouter); // Use the movies router at the /movies route
app.use("/genres" ,GenreRouter); // Use the genre router at the /genres route
app.use(errorHandler);
app.get("/", (res: Response) => {
    res.status(200).json({message: "Welcome to the API world"})
  })

export default app;
