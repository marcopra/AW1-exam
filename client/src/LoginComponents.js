import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';

function LoginForm(props) {
  const [username, setUsername] = useState('mario@polito.it');
  const [password, setPassword] = useState('password');
  const [errorMessage, setErrorMessage] = useState('') ;
  

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  }; 

  const handleSubmit = (event) => {
      event.preventDefault();
      setErrorMessage('');
      const credentials = { username, password };
      
      let valid = true;
      if(username === '' || password === '')
          valid = false;

      if (!validateEmail(username)) {
          valid = false;
      }

      if(valid)
      {
        props.login(credentials);
      }
      else {
        setErrorMessage('Invalid Username and/or Password.')
      }
  };

  return (
      <Container className = 'pt-5'>
          <Row>
              <Col>
                  <h2>Login</h2>
                  <Form>
                      {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : ''}
                      <Form.Group controlId='username'>
                          <Form.Label>email</Form.Label>
                          <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
                      </Form.Group>
                      <Form.Group controlId='password'>
                          <Form.Label>Password</Form.Label>
                          <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                      </Form.Group>
                      <Button onClick={handleSubmit}>Login</Button>
                  </Form>
              </Col>
          </Row>
      </Container>
    )
}

function LogoutButton(props) {
  
  return(
    
     <Button variant="outline-light" onClick={props.logout}> <i className="bi bi-person"/> Logout</Button>
    
  )
}

export { LoginForm, LogoutButton };