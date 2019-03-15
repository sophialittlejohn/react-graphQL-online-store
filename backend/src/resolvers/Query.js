const { forwardTo } = require('prisma-binding');

const Query = {
  //   async items(parent, args, context, info) {
  //     return context.db.query.items();
  //   }
  items: forwardTo('db')
};

module.exports = Query;
