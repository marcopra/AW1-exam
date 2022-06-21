import React from 'react';


import { Navbar, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom'
import { LogoutButton } from './LoginComponents';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';


const Navigation = (props) => {

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Navbar bg="primary" expand="sm" variant="dark" fixed="top" className="navbar-padding">
      <Link to="/">
        <Navbar.Brand>
          Piano Carriera
        </Navbar.Brand>
      </Link>
      

      <Nav className="ms-auto">
        <Nav.Item>
         { location.pathname !== "/login" ? (!props.loggedIn ? <Button variant = "outline-light" className="my-2 my-sm-0" type="submit" onClick = {() => navigate('/login')}> <i className="bi bi-person"/> Login</Button> : <LogoutButton logout={props.doLogOut} user={props.user}/>) : null}
        </Nav.Item>
      </Nav>
    </Navbar>
  );
}

export { Navigation }; 