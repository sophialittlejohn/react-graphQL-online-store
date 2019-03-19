const mutations = {
  async createItem(parent, args, context, info) {
    // TODO check if user is logged in
    const item = await context.db.mutation.createItem(
      {
        data: { ...args }
      },
      info
    );
    console.log('item', item);
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
  }
};

module.exports = mutations;
