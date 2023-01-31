import express from 'express';
import controller from '../controllers/user';
import extractJWT from '../middleware/extractJWT';
import { RegisterSchema, ValidateJoi } from '../middleware/joi';

const router = express.Router();

router.get('/home', controller.home);
router.get('/validate', extractJWT, controller.validateToken);
router.put('/saveProject', extractJWT, controller.saveProject);
router.post('/newProject', extractJWT, controller.newProject);
router.get('/allProjects', extractJWT, controller.allProjects);
router.get('/loadProject', extractJWT, controller.loadProject);
router.delete('/deleteProject', extractJWT, controller.deleteProject);
router.get('/publicProjects', controller.publicProjects);
router.get('/getPublicProject', controller.getPublicProject);
router.post('/register', ValidateJoi(RegisterSchema), controller.register);
router.post('/login', controller.login);
router.get('/get/all', controller.getAllUsers);
router.post('/token', controller.token);
router.delete('/logout', controller.deleteRefreshToken);

export = router;
