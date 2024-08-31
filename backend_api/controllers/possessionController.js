// Mock data
let possessions = [];

exports.getPossessions = (req, res) => {
    res.json(possessions);
};

exports.createPossession = (req, res) => {
    const { libelle, valeur, dateDebut, taux } = req.body;
    const newPossession = { libelle, valeur, dateDebut, taux, dateFin: null };
    possessions.push(newPossession);
    res.status(201).json(newPossession);
};

exports.updatePossession = (req, res) => {
    const { libelle } = req.params;
    const { dateFin } = req.body;
    const possession = possessions.find(p => p.libelle === libelle);
    if (possession) {
        possession.dateFin = dateFin;
        res.json(possession);
    } else {
        res.status(404).json({ message: 'Possession not found' });
    }
};

exports.closePossession = (req, res) => {
    const { libelle } = req.params;
    const possession = possessions.find(p => p.libelle === libelle);
    if (possession) {
        possession.dateFin = new Date().toISOString();
        res.json(possession);
    } else {
        res.status(404).json({ message: 'Possession not found' });
    }
};