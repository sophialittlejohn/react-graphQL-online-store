const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

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
  },
  async users(parent, args, context, info) {
    // 1. check if the user is logged in
    if (!context.request.userId) {
      throw new Error('You must be logged in');
    }
    // 2. check if the user has to permission to query all the users
    hasPermission(context.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
    // 3. if they do, query all the users
    return context.db.query.users({}, info);
  }
};

module.exports = Query;
