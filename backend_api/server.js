import * as fs from '../data/index.mjs'
import express from 'express';
import cors from 'cors';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Route de base
app.get('/', (req, res) => {
  fs.readFile('../data/data.json', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Erreur de lecture des données' });
    } else {
      res.send('Bienvenue sur le serveur de patrimoine économique');
    }
  });
});

// Route pour obtenir la liste des possessions
app.get('/possessions', async (req, res) => {
  try {
    const data = await fs.promises.readFile('../data/data.json', 'utf8');
    const possessions = JSON.parse(data).data.patrimoine.possessions;
    res.json(possessions);
  } catch (error) {
    res.status(500).json({ error: 'Erreur de lecture des données' });
  }
});

// Route pour créer une possession
app.post('/possessions', async (req, res) => {
  const newPossession = req.body;
  try {
    const data = await fs.promises.readFile('../data/data.json', 'utf8');
    const parsedData = JSON.parse(data);
    parsedData.data.patrimoine.possessions.push(newPossession);
    const updatedData = JSON.stringify(parsedData);
    await fs.promises.writeFile('../data/data.json', updatedData, 'utf8');
    res.status(201).json(newPossession);
  } catch (error) {
    res.status(500).json({ error: 'Erreur d\'écriture des données' });
  }
});

// Route pour mettre à jour une possession
app.put('/possessions/:id', async (req, res) => {
  const { id } = req.params;
  const updatedPossession = req.body;
  try {
    const data = await fs.promises.readFile('../data/data.json', 'utf8');
    const parsedData = JSON.parse(data);
    const possessionIndex = parsedData.data.patrimoine.possessions.findIndex(p => p.id === id);
    if (possessionIndex !== -1) {
      parsedData.data.patrimoine.possessions[possessionIndex] = updatedPossession;
      const updatedData = JSON.stringify(parsedData);
      await fs.promises.writeFile('../data/data.json', updatedData, 'utf8');
      res.json(updatedPossession);
    } else {
      res.status(404).json({ error: 'Possession non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur de mise à jour des données' });
  }
});

// Route pour supprimer une possession
app.delete('/possessions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const data = await fs.promises.readFile('../data/data.json', 'utf8');
    const parsedData = JSON.parse(data);
    const possessionIndex = parsedData.data.patrimoine.possessions.findIndex(p => p.id === id);
    if (possessionIndex !== -1) {
      parsedData.data.patrimoine.possessions.splice(possessionIndex, 1);
      const updatedData = JSON.stringify(parsedData);
      await fs.promises.writeFile('../data/data.json', updatedData, 'utf8');
      res.json({ message: 'Possession supprimée' });
    } else {
      res.status(404).json({ error: 'Possession non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur de suppression des données' });
  }
});

// Route pour obtenir la valeur du patrimoine à une date spécifique
app.get('/patrimoine/:date', async (req, res) => {
  const { date } = req.params;
  try {
    const data = await fs.promises.readFile('../data/data.json', 'utf8');
    const possessions = JSON.parse(data).data.patrimoine.possessions;
    const valeur = calculerValeurPatrimoine(possessions, date);
    res.json({ valeur });
  } catch (error) {
    res.status(500).json({ error: 'Erreur de calcul de la valeur du patrimoine' });
  }
});

// Fonction pour calculer la valeur du patrimoine à une date donnée
function calculerValeurPatrimoine(possessions, date) {
  const possessionsActives = possessions.filter(p => p.dateFin === null || new Date(p.dateFin) > new Date(date));
  let valeurTotale = 0;
  possessionsActives.forEach(possession => {
    // Calcul de la valeur en fonction du type de possession et de ses caractéristiques
    switch (possession.type) {
      case 'action':
        // Calcul spécifique pour les actions (prix actuel, dividendes, etc.)
        break;
      case 'immobilier':
        // Calcul spécifique pour l'immobilier (estimation, loyers, etc.)
        break;
      // ... autres types de possessions
      default:
        // Calcul par défaut
        valeurTotale += possession.prixAcquisition;
    }
  });
  return valeurTotale;
}

// ... (autres routes, fonctions, etc.)

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});