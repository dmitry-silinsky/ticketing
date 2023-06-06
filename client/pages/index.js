import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {
  const ticketList = tickets.map(t => {
    return (
      <tr key={t.id}>
        <td>{t.title}</td>
        <td>{t.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${t.id}`}>
            View
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Tickets</h1>

      <Link href="/tickets/new" className="btn btn-outline-primary">
        Add Ticket
      </Link>

      <table className="table mt-3">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {ticketList}
        </tbody>
      </table>
    </div>
  );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');

  return { tickets: data };
};

export default LandingPage;
