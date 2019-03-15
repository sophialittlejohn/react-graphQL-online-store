const mutations = {
  async createItem(parent, args, context, info) {
    // TODO check if user is logged in
    console.log(args);
    const item = await context.db.mutation.createItem(
      {
        data: { ...args }
      },
      info
    );
    console.log('item', item);
    return item;
  }
};

module.exports = mutations;
