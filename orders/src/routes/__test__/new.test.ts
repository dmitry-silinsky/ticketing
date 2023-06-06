import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/Ticket';
import { Order } from '../../models/Order';
import { OrderStatus } from '@sdm888tickets/common';
import { natsWrapper } from '../../NatsWrapper';

it('returns an error if the ticket does not exist', function () {
  const ticketId = new mongoose.Types.ObjectId();

  request(app)
    .post('/api/orders')
    .set('Cookie', global.signIn())
    .send({ ticketId })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async function () {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 10
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: 'skldfjd',
    status: OrderStatus.Created,
    expiresAt: new Date()
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signIn())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserves a ticket', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 10
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signIn())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it('emits an order created event', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 10
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signIn())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
