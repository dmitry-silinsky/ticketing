import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { ErrorHandler, RouteNotFoundError, CurrentUser } from '@sdm888tickets/common';
import { createTicketRouter } from './routes/new';
import { updateTicketRouter } from './routes/update';
import { indexTicketRouter } from './routes/index';
import { showTicketRouter } from './routes/show';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test'
}));
app.use(CurrentUser);

app.use(createTicketRouter);
app.use(updateTicketRouter);
app.use(indexTicketRouter);
app.use(showTicketRouter);

app.all('*', async (req, res) => {
  throw new RouteNotFoundError();
});

app.use(ErrorHandler);

export { app };
