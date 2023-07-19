const jwt = require('jsonwebtoken');
const responseStatus = require('../config/responseStatus.json');
const jwtSecret = 'h3h3h3h3';

async function getProfile(req, res) {
  const authorizationHeader = req.headers.authorization;
  const accessToken = authorizationHeader.split(' ')[1];
  const { id, email, full_name, role } = await jwt.verify(accessToken, jwtSecret);
  
  return res.status(200).json({
    status: responseStatus[2000000],
    result: { id, email, full_name, role }
  });
}

module.exports = { getProfile };