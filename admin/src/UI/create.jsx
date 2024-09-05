import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './CreatePossessionPage.css';

const CreatePossessionPage = () => {
  const [newPossession, setNewPossession] = useState({
    libelle: '',
    valeur: '',
    dateDebut: '',
    dateFin: '',
    tauxAmortissement: ''
  });
  
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = ({ target: { name, value } }) => {
    setNewPossession(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const { valeur, dateDebut, dateFin, ...rest } = newPossession;
    const valeurNumber = parseFloat(valeur);

    if (isNaN(valeurNumber)) {
      setError('La valeur doit être un nombre');
      return;
    }

    try {
      const response = await fetch('http://localhost:6000/possession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          possesseur: { nom: 'John Doe' },
          ...rest,
          valeur: valeurNumber,
          dateDebut: new Date(dateDebut).toISOString(),
          dateFin: dateFin ? new Date(dateFin).toISOString() : null
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      navigate('/possession');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la possession:', error);
      setError('Une erreur est survenue, veuillez réessayer.');
    }
  };

  return (
    <div className="create-possession-container">
      <h1>Ajouter une Nouvelle Possession</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <Form>
        <Form.Group controlId="formLibelle">
          <Form.Label>Libelle</Form.Label>
          <Form.Control
            type="text"
            name="libelle"
            value={newPossession.libelle}
            onChange={handleChange}
            placeholder="Entrez le libelle"
          />
        </Form.Group>
        <Form.Group controlId="formValeur">
          <Form.Label>Valeur</Form.Label>
          <Form.Control
            type="number"
            name="valeur"
            value={newPossession.valeur}
            onChange={handleChange}
            placeholder="Entrez la valeur"
          />
        </Form.Group>
        <Form.Group controlId="formDateDebut">
          <Form.Label>Date de Début</Form.Label>
          <Form.Control
            type="date"
            name="dateDebut"
            value={newPossession.dateDebut}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="formDateFin">
          <Form.Label>Date de Fin (optionnelle)</Form.Label>
          <Form.Control
            type="date"
            name="dateFin"
            value={newPossession.dateFin}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="formTauxAmortissement">
          <Form.Label>Taux d'Amortissement</Form.Label>
          <Form.Control
            type="number"
            name="tauxAmortissement"
            value={newPossession.tauxAmortissement}
            onChange={handleChange}
            placeholder="Entrez le taux d'amortissement"
          />
        </Form.Group>
        <Button variant="primary" onClick={handleSave}>
          Ajouter
        </Button>
      </Form>
    </div>
  );
};

export default CreatePossessionPage;
