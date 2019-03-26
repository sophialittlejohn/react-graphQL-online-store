const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
  },
  async signup(parent, args, context, info) {
    args.email = args.email.toLowerCase();
    // 1. hash the password (one way hash with salt (numb at the end which makes pw it unique))
    const password = await bcrypt.hash(args.password, 10);
    // 2. create user in the db
    const user = await context.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] }
        }
      },
      info
    );
    // 3. create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 4. set thhe jwt as cookie on the respionse
    context.response.cookie('token', token, {
      httpOnly: true,
      maxAge: MAX_TOKEN_AGE
    });
    return user;
  },
  async signin(parent, { email, password }, context, info) {
    // 1. check if there is a user with that email
    const user = await context.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    // 2. check if their pw is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid password!');
    }
    // 3. generate jwt token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 4. set the cookie with the token
    context.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return user;
  },
  signout(parent, args, context, info) {
    context.response.clearCookie('token');
    return { message: 'Goodbye' };
  }
};

module.exports = mutations;
