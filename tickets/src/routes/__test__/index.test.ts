import request from 'supertest';
import { app } from '../../app';

const createTicket = (title: string, price: number) => {
  return request(app)
      .post('/api/tickets')
      .set('Cookie', global.signIn())
      .send({ title, price });
};

it('can fetch a list of tickets', async () => {
  await createTicket('ticket1', 10);
  await createTicket('ticket2', 20);
  await createTicket('ticket3', 30);

  const response = await request(app)
      .get('/api/tickets')
      .send()
      .expect(200);
  expect(response.body.length).toEqual(3);
});
