import { Ticket } from '../../models/Ticket';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/Order';
import { natsWrapper } from '../../NatsWrapper';
import mongoose from 'mongoose';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 20
  });
  await ticket.save();

  return ticket;
};

const createOrder = async (userCookies: string[], ticketId: string) => {
  const { body: order } = await request(app)
    .post(`/api/orders`)
    .set('Cookie', userCookies)
    .send({ ticketId: ticketId })
    .expect(201);

  return order;
};

it('marks an order as cancelled', async () => {
  const ticket = await buildTicket();

  const user = global.signIn();

  const order = await createOrder(user, ticket.id);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(204);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits a order cancelled event', async () => {
  const ticket = await buildTicket();

  const user = global.signIn();

  const order = await createOrder(user, ticket.id);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
