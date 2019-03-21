const { forwardTo } = require('prisma-binding');

const Query = {
  //   async items(parent, args, context, info) {
  //     return context.db.query.items();
  //   }
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, context, info) {
    //check if there is a current userId
    if (!context.request.userId) {
      return null;
    }
    return context.db.query.user(
      { where: { id: context.request.userId } },
      info
    );
  }
};

module.exports = Query;
