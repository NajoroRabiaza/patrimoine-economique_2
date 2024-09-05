import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import data from '../data/data.json';
import Possession from "../models/possessions/Possession";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './header';
import Patrimoine from './Patrimoine';
import { Line } from 'react-chartjs-2';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const transformDataToPossessions = (data) => {
  const possessionsData = data.find(item => item.model === "Patrimoine").data.possessions;
  return possessionsData.map(item =>
    new Possession(
      item.possesseur.nom,
      item.libelle,
      item.valeur,
      new Date(item.dateDebut),
      item.dateFin ? new Date(item.dateFin) : null,
      item.tauxAmortissement,
      item.jour || null,
      item.valeurConstante || null
    )
  );
};

function App() {
  const [info, setInfo] = useState([]);
  const [dateActuelle, setDateActuelle] = useState(new Date().toISOString().split('T')[0]);
  const [editingPossession, setEditingPossession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPossession, setNewPossession] = useState({
    libelle: '',
    valeur: '',
    dateDebut: '',
    dateFin: '',
    tauxAmortissement: ''
  });

  const handleAddModalChange = ({ target: { name, value } }) => {
    setNewPossession(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSave = async () => {
    try {
      const valeur = parseFloat(newPossession.valeur);
      if (isNaN(valeur)) throw new Error('La valeur doit être un nombre');

      const response = await fetch('http://localhost:3000/possession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          possesseur: { nom: 'John Doe' },
          ...newPossession,
          valeur,
          dateDebut: new Date(newPossession.dateDebut).toISOString(),
          dateFin: newPossession.dateFin ? new Date(newPossession.dateFin).toISOString() : null
        })
      });

      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

      const addedPossession = await response.json();
      setInfo(prevInfo => [...prevInfo, addedPossession]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la possession:', error);
    }
  };

  useEffect(() => {
    setInfo(transformDataToPossessions(data));
  }, []);

  const handleDateActuelleChange = ({ target: { value } }) => {
    setDateActuelle(value);
  };

  const currentDate = new Date(dateActuelle);

  const calculerSommeTotale = () => info.reduce((total, poss) => total + poss.getValeur(currentDate), 0);

  const chartData = {
    labels: info.map(pos => pos.libelle),
    datasets: [{
      label: 'Valeur à la date T',
      data: info.map(pos => pos.getValeur(currentDate)),
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: ({ label, raw }) => `${label}: ${raw.toFixed(2)} Ar`
        }
      }
    },
    elements: {
      line: { borderWidth: 2 },
      point: { radius: 3 }
    }
  };

  const handleEdit = possession => {
    setEditingPossession(possession);
    setShowModal(true);
  };

  const handleClose = async (index) => {
    try {
      const possession = info[index];
      const response = await fetch(`http://localhost:3000/possession/${encodeURIComponent(possession.libelle)}/close`, {
        method: 'PATCH'
      });

      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

      const updatedPossession = await response.json();
      const updatedInfo = info.map((p, i) => (i === index ? { ...p, dateFin: updatedPossession } : p));
      setInfo(updatedInfo);
    } catch (error) {
      console.error('Erreur lors de la fermeture de la possession:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:3000/possession/${encodeURIComponent(editingPossession.libelle)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateFin: editingPossession.dateFin,
          valeur: editingPossession.valeur,
          tauxAmortissement: editingPossession.tauxAmortissement
        })
      });

      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

      const updatedPossession = await response.json();
      const updatedInfo = info.map(poss => (poss.libelle === editingPossession.libelle ? updatedPossession : poss));
      setInfo(updatedInfo);
      setShowModal(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des modifications:', error);
    }
  };

  const handleModalChange = ({ target: { name, value } }) => {
    setEditingPossession(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/patrimoine" element={
            <div>
              <div className="chart-container">
                <Line data={chartData} options={chartOptions} />
                <label>
                  <input type="date" value={dateActuelle} onChange={handleDateActuelleChange} />
                </label>
              </div>
            </div>
          } />
          <Route path="/possession" element={
            <div>
              <Button variant="success" onClick={() => setShowAddModal(true)}>
                Ajouter une nouvelle possession
              </Button>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Libelle</th>
                    <th>Valeur initiale</th>
                    <th>Date de debut</th>
                    <th>Date de fin</th>
                    <th>Amortissement</th>
                    <th>
                      Valeur à la date T:
                      <label>
                        <input type="date" value={dateActuelle} onChange={handleDateActuelleChange} />
                      </label>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {info.map((poss, index) => (
                    <tr key={index}>
                      <td>{poss.libelle}</td>
                      <td>{poss.valeur}</td>
                      <td>{poss.dateDebut.toLocaleDateString()}</td>
                      <td>{poss.dateFin ? poss.dateFin.toLocaleDateString() : 'N/A'}</td>
                      <td>{poss.tauxAmortissement}</td>
                      <td>{poss.getValeur(currentDate)}</td>
                      <td>
                        <Button variant="warning" onClick={() => handleEdit(poss)}>Editer</Button>
                        <Button variant="danger" onClick={() => handleClose(index)}>Fermer</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          } />
          <Route path="/" element={<Patrimoine />} />
        </Routes>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Modifier la Possession</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className="form-group">
                <label htmlFor="libelle">Libelle:</label>
                <input
                  type="text"
                  id="libelle"
                  name="libelle"
                  value={editingPossession?.libelle || ''}
                  onChange={handleModalChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="valeur">Valeur:</label>
                <input
                  type="number"
                  id="valeur"
                  name="valeur"
                  value={editingPossession?.valeur || ''}
                  onChange={handleModalChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateFin">Date de fin:</label>
                <input
                  type="date"
                  id="dateFin"
                  name="dateFin"
                  value={editingPossession?.dateFin?.toISOString().split('T')[0] || ''}
                  onChange={handleModalChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="tauxAmortissement">Taux d'Amortissement:</label>
                <input
                  type="number"
                  id="tauxAmortissement"
                  name="tauxAmortissement"
                  value={editingPossession?.tauxAmortissement || ''}
                  onChange={handleModalChange}
                  className="form-control"
                />
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleSave}>Sauvegarder</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Ajouter une Nouvelle Possession</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className="form-group">
                <label htmlFor="libelle">Libelle:</label>
                <input
                  type="text"
                  id="libelle"
                  name="libelle"
                  value={newPossession.libelle}
                  onChange={handleAddModalChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="valeur">Valeur:</label>
                <input
                  type="number"
                  id="valeur"
                  name="valeur"
                  value={newPossession.valeur}
                  onChange={handleAddModalChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateDebut">Date de début:</label>
                <input
                  type="date"
                  id="dateDebut"
                  name="dateDebut"
                  value={newPossession.dateDebut}
                  onChange={handleAddModalChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateFin">Date de fin:</label>
                <input
                  type="date"
                  id="dateFin"
                  name="dateFin"
                  value={newPossession.dateFin}
                  onChange={handleAddModalChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="tauxAmortissement">Taux d'Amortissement:</label>
                <input
                  type="number"
                  id="tauxAmortissement"
                  name="tauxAmortissement"
                  value={newPossession.tauxAmortissement}
                  onChange={handleAddModalChange}
                  className="form-control"
                />
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleAddSave}>Ajouter</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Router>
  );
}

export default App;
