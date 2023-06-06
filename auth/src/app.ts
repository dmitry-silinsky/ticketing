import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/currentUser';
import { signInRouter } from './routes/signIn';
import { signUpRouter  } from './routes/signUp';
import { signOutRouter } from './routes/signOut';
import { ErrorHandler, RouteNotFoundError } from '@sdm888tickets/common';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test'
}));

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signUpRouter);
app.use(signOutRouter);

app.all('*', async (req, res) => {
  throw new RouteNotFoundError();
});

app.use(ErrorHandler);

export { app };
