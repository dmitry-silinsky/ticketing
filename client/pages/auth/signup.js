import {useState} from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

export default () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/users/signup',
    method: 'post',
    body: { email, password },
    onSuccess: () => Router.push('/')
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    await doRequest();
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign Up</h1>
      <div className="form-group">
        <label htmlFor="emailInput">E-mail</label>
        <input
            type="email"
            id="emailInput"
            className="form-control"
            value={email}
            onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="passwordInput">Password</label>
        <input
            type="password"
            id="passwordInput"
            className="form-control"
            value={password}
            onChange={e => setPassword(e.target.value)}
        />
      </div>
      {errors}

      <button className="btn btn-outline-primary">Sign In</button>
    </form>
  );
};
