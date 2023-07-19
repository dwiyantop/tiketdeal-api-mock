const responseStatus = require('../config/responseStatus.json');

async function postMockSucess(req, res) {
  setTimeout(() => {
    return res.status(200).json({
      status: responseStatus[2000000],
      result: null
    });
  }, 2000);
}

module.exports = { postMockSucess };
