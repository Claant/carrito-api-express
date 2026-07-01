import express from 'express';
import controller from './controller.js';

// creamos una instancia de express.Router()
const usuariosRoutes = express.Router();

// creamos las rutas personalizadas, asociadas a las funciones contenidas en el archivo controller
usuariosRoutes.post('/usuarios', controller.handleInsertUsuarioRequest);
usuariosRoutes.get('/usuarios', controller.handleGetUsuariosRequest);
usuariosRoutes.get('/usuarios/:id', controller.handleGetUsuarioByIdRequest);
usuariosRoutes.put('/usuarios/:id', controller.handleUpdateUsuarioByIdRequest);
usuariosRoutes.delete('/usuarios/:id', controller.handleDeleteUsuarioByIdRequest);

export default usuariosRoutes;
