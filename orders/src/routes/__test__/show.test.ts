import { Ticket } from '../../models/Ticket';
import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns an error if the user is not authorized', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .get(`/api/orders/${orderId}`)
    .send()
    .expect(401);
});

it('returns an error if the order is not found', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .get(`/api/orders/${orderId}`)
    .set('Cookie', global.signIn())
    .send()
    .expect(404);
});

it('fetches the order', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 20
  });
  await ticket.save();

  const user = global.signIn();

  const { body: order } = await request(app)
    .post(`/api/orders`)
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch another users order', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 20
  });
  await ticket.save();

  const user = global.signIn();

  const { body: order } = await request(app)
    .post(`/api/orders`)
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signIn())
    .expect(401);
});
