const { getData, writeData } = require('../utils/dataHandler');
const dataPath = './data/data.json';

exports.getValeurPatrimoine = async (req, res) => {
    try {
        const data = await getData(dataPath);
        // Logique pour obtenir la valeur du patrimoine à une date spécifique
        res.json(data.patrimoine);
    } catch (error) {
        res.status(500).send('Erreur lors de la récupération des données');
    }
};

exports.getValeurPatrimoineRange = async (req, res) => {
    try {
        const { dateDebut, dateFin, jour } = req.body;
        const data = await getData(dataPath);
        // Logique pour obtenir la valeur du patrimoine dans une plage de dates
        res.json(data.patrimoine); // Remplacer par la logique appropriée
    } catch (error) {
        res.status(500).send('Erreur lors de la récupération des données');
    }
};
