const mutations = {
  async createItem(parent, args, context, info) {
    // TODO check if user is logged in
    const item = await context.db.mutation.createItem(
      {
        data: { ...args }
      },
      info
    );

    return item;
  },
  updateItem(parent, args, context, info) {
    // first take a copy of the updates
    const updates = { ...args };
    // remove ID from the updates
    delete updates.id;
    return context.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },
  async deleteItem(parent, args, context, info) {
    const where = { id: args.id };
    // 1 find the items
    // const item = await context.db.query.item({ where }, `{id title}`);
    // 2 check if they own that item or have the permissions
    //TODO
    // 3 delete
    return context.db.mutation.deleteItem({ where }, info);
  }
};

module.exports = mutations;
