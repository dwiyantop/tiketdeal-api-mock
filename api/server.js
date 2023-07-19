const path = require('path');
const jsonServer = require('json-server');
const authGuard = require('./authGuard');

const db = path.join(__dirname, '../config/db.json');
const routeOptions = require('../config/routeOptions.json');

const server = jsonServer.create();
const router = jsonServer.router(db);
const middlewares = jsonServer.defaults();
const { registerUser, loginUser, refreshAccessToken } = require('./handleAuthentication');
const { getProfile } = require('./getProfile');
const paginationMiddleware = require('./paginationMiddleware')(router);

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(authGuard);
server.post('/api/admin/auth/register', registerUser);
server.post('/api/admin/auth/login', loginUser);
server.post('/api/admin/auth/refresh-token', refreshAccessToken);
server.get('/api/admin/auth/profile', getProfile);
server.use(paginationMiddleware);

server.use(jsonServer.rewriter(routeOptions.rewriteRoutes))
server.use(router);
server.listen(3000, () => { console.log('JSON Server is running') });