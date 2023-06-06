import { useState } from 'react';
import axios from 'axios';

export default ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {
    try {
      setErrors(null);

      const response = await axios[method](url, {...body, ...props });

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      const errors = [];
      if (err.response.data?.message) {
        errors.push(err.response.data.message);
      } else {
        err.response.data.errors.forEach(e => errors.push(e.message));
      }

      setErrors(
        <div className="alert alert-danger">
          <h4>Whoops...</h4>
          <ul className="list-unstyled my-0">
            {errors.map((err, i) =>
                <li key={i}>{err}</li>
            )}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errors };
};
