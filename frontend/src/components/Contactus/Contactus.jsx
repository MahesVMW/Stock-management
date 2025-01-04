import React from 'react';
import styles from './Contactus.module.css';
import { useSnackbar } from 'notistack';

const Contactus = () => {
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    fetch("https://formspree.io/f/xvoedrpj", {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        enqueueSnackbar('Form submitted successfully!', { variant: 'success' });
      } else {
        response.json().then(data => {
          if (data.errors) {
            enqueueSnackbar('Error: ' + data.errors.map(error => error.message).join(', '), { variant: 'error' });
          } else {
            enqueueSnackbar('Error submitting form', { variant: 'error' });
          }
        });
      }
    }).catch(error => {
      enqueueSnackbar('Network error: ' + error.message, { variant: 'error' });
    });
    event.target.reset();
  };

  return (
    <div className={`${styles['contactus-container']} mt-5`}>
      <div className={`${styles['contact-wrapper']} row justify-content-center`}>
        <div className={`${styles['contact-form']} col-md-6`}>
          <div className="card">
            <h1 className="text-center mt-4">Contact Us</h1>
            <div className="card-body">
              <form onSubmit={handleSubmit} id="contact-form">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input type="text" className="form-control" id="name" name="name" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input type="email" className="form-control" id="email" name="email" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">Leave a Message</label>
                  <textarea className="form-control" id="message" name="message" rows="5" required></textarea>
                </div>
                <div className="d-flex justify-content-center">
                  <button type="submit" className="btn btn-info">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contactus;
