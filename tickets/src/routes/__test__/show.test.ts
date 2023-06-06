import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

jest.mock('../../NatsWrapper');

it('returns a 404 if the ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
      .get(`/api/tickets/${id}`)
      .send()
      .expect(404);
});

it('returns the ticket if the ticket is found', async () => {
  const title = 'ticket';
  const price = 10;

  const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signIn())
      .send({ title, price })
      .expect(201);

  const ticketResponse = await request(app)
      .get(`/api/tickets/${(response.body.id)}`)
      .set('Cookie', global.signIn())
      .send()
      .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
