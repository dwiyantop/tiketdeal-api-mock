const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const dbFilePath = path.join(__dirname, '../config/db.json');
const responseStatus = require('../config/responseStatus.json');
const jwtSecret = 'h3h3h3h3';

async function verifyJwt(token) {
  try {
    const decoded = await jwt.verify(token, jwtSecret);
    return decoded;
  } catch (err) {
    return null;
  }
}

function registerUser(req, res) {
  const { email, password, full_name, role } = req.body;
  const dbData = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));

  if (dbData.users.find(user => user.email === email)) {
    return res.status(422).json({
      status: {
        ...responseStatus[4000005],
        message: 'Email already registered'
      },
      result: null
    });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({
        status: responseStatus[5000000],
        result: null
      });
    }

    const newUser = {
      id: uuidv4(),
      email: email,
      password: hashedPassword,
      full_name: full_name,
      role: role
    };

    dbData.users.push(newUser);

    fs.writeFileSync(dbFilePath, JSON.stringify(dbData, null, 2));

    return res.status(201).json({
      status: responseStatus[2000000],
      result: null
    });
  });
}

function loginUser(req, res) {
  const { email, password } = req.body;
  const dbData = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
  const userData = dbData.users.find(user => user.email === email);

  if (!userData) {
    return res.status(401).json({
      status: {
        ...responseStatus[4000003],
        message: 'Invalid email or password'
      },
      result: null
    });
  }

  bcrypt.compare(password, userData.password, (err, result) => {
    if (err) {
      return res.status(500).json({
        status: {
          ...responseStatus[5000000],
          message: 'Error comparing passwords'
        },
        result: null
      });
    }

    if (!result) {
      return res.status(401).json({
        status: {
          ...responseStatus[4000003],
          message: 'Invalid email or password'
        },
        result: null
      });
    }

    const JWTPayload = {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role
    }

    const accessToken = jwt.sign(JWTPayload, jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign(JWTPayload, jwtSecret, { expiresIn: '7d' });

    return res.status(200).json({
      status: responseStatus[2000000],
      result: {
        access_token: accessToken,
        refresh_token: refreshToken,
        profile: JWTPayload
      }
    });
  });
}

async function refreshAccessToken(req, res) {
  const { refresh_token: refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      status: {
        ...responseStatus[4000003],
        message: 'Invalid or expired refresh token',
      },
      result: null,
    });
  }

  const decodedVerifyToken = await verifyJwt(refreshToken);

  if (!decodedVerifyToken) {
    return res.status(401).json({
      status: {
        ...responseStatus[4000003],
        message: 'Invalid or expired refresh token',
      },
      result: null,
    });
  }

  const { id, email, full_name, role } = decodedVerifyToken;
  const accessToken = jwt.sign({ id, email, full_name, role }, jwtSecret, { expiresIn: '15m' });
  const newRefreshToken = jwt.sign({ id, email, full_name, role }, jwtSecret, { expiresIn: '7d' });

  return res.status(200).json({
    status: responseStatus[2000000],
    result: {
      access_token: accessToken,
      refresh_token: newRefreshToken,
      profile: { id, email, full_name, role },
    },
  });
}

module.exports = { verifyJwt, registerUser, loginUser, refreshAccessToken };
