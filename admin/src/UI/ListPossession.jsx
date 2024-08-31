import React from 'react';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import './ListPossession.css';

const ListPossession = () => {
  return (
    <div>
      <Button variant="success" as={Link} to="/possession/create">
        Ajouter une nouvelle possession
      </Button>
    </div>
  );
};

export default ListPossession;
