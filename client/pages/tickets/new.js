import { useState } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const NewTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: { title, price },
    onSuccess: ticket => Router.push('/')
  });

  const onBlurPrice = () => {
    const value = parseFloat(price);

    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  };

  const onSubmit = (event) => {
    event.preventDefault();

    doRequest();
  };

  return (
    <div>
      <h1>Create a ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="form-control"
            type="text"
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            value={price}
            onChange={e => setPrice(e.target.value)}
            onBlur={onBlurPrice}
            className="form-control"
            type="number"
          />
        </div>
        {errors}
        <button className="btn btn-outline-primary">Submit</button>
      </form>
    </div>
  );
};

export default NewTicket;
