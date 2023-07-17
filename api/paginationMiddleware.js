const responseStatus = require('../config/responseStatus.json');

function paginationMiddleware(router) {
  return function(req, res, next) {
    const { query, method } = req;
    const isEmptyQuery = Object.keys(query).length === 0 && query.constructor === Object;

    if (method !== 'GET') {
      return next();
    }

    let page = 1;
    let size = 1;

    if (!isEmptyQuery) {
      if (req.query.page) {
        page = parseInt(req.query.page) || 1;
        req.query._page = page
        delete req.query.page;
      }

      if (req.query.size) {
        size = parseInt(req.query.size) || 25;
        req.query._limit = size;
        delete req.query.size;
      }

      if (req.quer.sort) {
        req.query._sort = sort;
        delete req.query._sort;
      }

      if (req.quer.order) {
        req.query._order = order;
        delete req.query._order;
      }
    }

    router.render = (req, res) => {
      if (Array.isArray(res.locals.data)) {
        const totalItem = res.get('X-Total-Count');
        const totalPage = Math.ceil(totalItem / size);

        const invalidPage = totalPage > 0 && page > totalPage;

        if (!invalidPage) {
          return res.status(200).json({
            status: responseStatus[2000000],
            result: {
              data: res.locals.data,
              page,
              size,
              total_item: totalItem,
              total_page: totalPage
            }
          });
        } else {
          return res.status(400).json({
            status: responseStatus[4000000],
            result: null
          });
        }
      } else {
        const isNotFound = Object.keys(res.locals.data).length === 0;

        if (!isNotFound) {
          return res.status(200).json({
            status: responseStatus[2000000],
            result: res.locals.data
          });
        } else {
          return res.status(404).json({
            status: responseStatus[4000004],
            result: null
          });
        }
      }
    };

    next();
  };
}

module.exports = paginationMiddleware;
