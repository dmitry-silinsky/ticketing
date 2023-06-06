import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../NatsWrapper';
import { Ticket } from '../../models/Ticket';

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', global.signIn())
      .send({ title: 'ticket', price: 10 })
      .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
      .put(`/api/tickets/${id}`)
      .send()
      .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signIn())
      .send({ title: 'ticket1', price: 10 });

  await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', global.signIn())
      .send({ title: 'ticket2', price: 20 })
      .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signIn();

  const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: 'ticket1', price: 10 });

  await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: '', price: 20 })
      .expect(400);

  await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ price: 20 })
      .expect(400);

  await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: 'ticket2' })
      .expect(400);

  await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title: 'ticket2', price: -20 })
      .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signIn();

  const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: 'ticket1', price: 10 });

  const title = 'ticket2';
  const price = 20;

  const updateResponse = await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title, price })
      .expect(200);

  expect(updateResponse.body.title).toEqual(title);
  expect(updateResponse.body.price).toEqual(price);
});

it('publishes an event', async () => {
  const cookie = global.signIn();

  const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: 'ticket1', price: 10 });

  const title = 'ticket2';
  const price = 20;

  const updateResponse = await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({ title, price })
      .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
  const cookie = global.signIn();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'Concert', price: 10 });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set(({ orderId: new mongoose.Types.ObjectId().toHexString() }));
  await ticket!.save();

  const updateResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'New Concert', price: 20 })
    .expect(400);
});
