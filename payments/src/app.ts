import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { ErrorHandler, RouteNotFoundError, CurrentUser } from '@sdm888tickets/common';
import { createChargeRouter } from './routes/new';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test'
}));
app.use(CurrentUser);

app.use(createChargeRouter);

app.all('*', async (req, res) => {
  throw new RouteNotFoundError();
});

app.use(ErrorHandler);

export { app };
