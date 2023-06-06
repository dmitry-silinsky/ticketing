import { Ticket } from '../../models/Ticket';
import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 10
  });
  await ticket.save();

  return ticket;
};

const createOrder = async (userCookies: string[], ticketId: string) => {
  const { body } = await request(app)
    .post('/api/orders')
    .set('Cookie', userCookies)
    .send({ ticketId })
    .expect(201);

  return body.id;
};

it('fetches orders for an particular user', async () => {
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOne = global.signIn();
  const userTwo = global.signIn();

  const orderOneId = await createOrder(userOne, ticketOne.id);

  const orderTwoId = await createOrder(userTwo, ticketTwo.id);
  const orderThreeId = await createOrder(userTwo, ticketThree.id);

  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200);

  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderTwoId);
  expect(response.body[1].id).toEqual(orderThreeId);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
