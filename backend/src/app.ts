import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { notFound } from "./middlewares/notFound";
import { errorHandlder } from "./middlewares/errorHandler";
import { apiRouter } from "./routes";


export function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(env.API_PREFIX, apiRouter());

    app.use(notFound);
    app.use(errorHandlder);


    return app;
}

