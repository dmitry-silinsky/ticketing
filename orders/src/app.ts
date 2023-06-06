import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { ErrorHandler, RouteNotFoundError, CurrentUser } from '@sdm888tickets/common';

import { indexOrderRouter } from './routes/index';
import { showOrderRouter } from './routes/show';
import { newOrderRouter } from './routes/new';
import { deleteOrderRouter } from './routes/delete';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test'
}));
app.use(CurrentUser);

app.use(indexOrderRouter);
app.use(showOrderRouter);
app.use(newOrderRouter);
app.use(deleteOrderRouter);

app.all('*', async (req, res) => {
  throw new RouteNotFoundError();
});

app.use(ErrorHandler);

export { app };
