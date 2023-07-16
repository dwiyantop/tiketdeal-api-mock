const { verifyJwt } = require('./handleAuthentication');
const routeOptions = require('../config/routeOptions.json');
const responseStatus = require('../config/responseStatus.json');

async function authGuard(req, res, next) {
  const protectedRoutes = routeOptions.protectedRoutes;
  const originalUrl = req.originalUrl.split('?')[0];
  const isProtected = protectedRoutes.some(route => originalUrl.startsWith(route));

  if (!isProtected) {
    return next();
  }

  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: responseStatus[4000003],
      result: null
    });
  }

  const accessToken = authorizationHeader.split(' ')[1];

  const decodedVerifyToken = await verifyJwt(accessToken);
  if (!decodedVerifyToken) {
    return res.status(401).json({
      status: {
        ...responseStatus[4000003],
        message: 'Invalid or expired refresh token',
      },
      result: null,
    });
  }

  req.user = decodedVerifyToken;

  next();
}

module.exports = authGuard;
