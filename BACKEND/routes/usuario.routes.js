const express = require('express');
const router = express.Router();
const usuarioCtrl = require('../controllers/usuarioController');

router.get('/', usuarioCtrl.listar);
router.get('/:id', usuarioCtrl.obtener);
router.post('/', usuarioCtrl.crear);
router.put('/:id', usuarioCtrl.actualizar);
router.delete('/:id', usuarioCtrl.eliminar);

module.exports = router;