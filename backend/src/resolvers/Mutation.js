const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { hasPermission } = require('../utils');

const { transport, makeANiceEmail } = require('../mail');

const MAX_TOKEN_AGE = 1000 * 60 * 60 * 24 * 365;

const mutations = {
  async createItem(parent, args, context, info) {
    if (!context.request.userId) {
      throw new Error('You must be logged in to do that!');
    }
    const item = await context.db.mutation.createItem(
      {
        data: {
          // this is how to create a relationship between item and user
          user: {
            connect: { id: context.request.userId }
          },
          ...args
        }
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
    const item = await context.db.query.item({ where }, `{id title user {id}}`);
    // 2 check if they own that item or have the permissions
    //TODO
    const ownsItem = item.user.id === context.request.userId;
    // sum checks if at least one is true
    const hasPermissions = context.request.user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    );
    if (!ownsItem && !hasPermissions) {
      throw new Error("You can't do that!");
    }
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
      maxAge: MAX_TOKEN_AGE
    });
    return user;
  },
  signout(parent, args, context, info) {
    context.response.clearCookie('token');
    return { message: 'Goodbye' };
  },
  async requestReset(parent, { email }, context, info) {
    // 1. check if this is real user
    const randomBytesPromiseified = promisify(randomBytes);
    const user = await context.db.query.user({ where: { email: email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    // 2. set reset token and expiry
    const resetToken = (await randomBytesPromiseified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;
    await context.db.mutation.updateUser({
      where: { email: email },
      data: { resetToken, resetTokenExpiry }
    });
    // 3. email them that reset token
    await transport.sendMail({
      from: 'littlejohn.sophia@gmail.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: makeANiceEmail(
        `Your Password Reset Token is here! \n\n <a href="${
          process.env.FRONTEND_URL
        }/reset-password?resetToken=${resetToken}">Click here to reset</a>`
      )
    });
    // 4 return the message
    return { message: 'Thanks' };
  },
  async resetPassword(
    parent,
    { resetToken, password, confirmPassword },
    context,
    info
  ) {
    // 1. check if this pw's match
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    // 2. check it its a legit reset token
    // 3. check if its expired
    const [user] = await context.db.query.users({
      where: {
        resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // 4. hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    // 5. save new password to the user and remove old resetToken
    const updatedUser = await context.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    // 6. generate jwt
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // 7. set jwt cookie
    context.response.cookie('token', token, {
      httpOnly: true,
      maxAge: MAX_TOKEN_AGE
    });
    return updatedUser;
  },
  async updatePermissions(parent, args, context, info) {
    // 1. check if the user is logged in
    if (!context.request.userId) {
      throw new Error('You must be logged in to do that!');
    }
    // 2. query the current userId
    const currentUser = await context.db.query.user(
      {
        where: { id: context.request.userId }
      },
      info
    );
    // 3. check if they have permissions to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
    // 4. update the permissions
    return context.db.mutation.updateUser(
      {
        data: {
          permissions: {
            // have to use set syntax bc permissions in an enum
            set: args.permissions
          }
        },
        where: { id: args.userId }
      },
      info
    );
  },
  async addToCart(parent, { id }, context, info) {
    // 1. make sure the user is signed in
    const { userId } = context.request;
    if (!userId) {
      throw new Error('You must be signed in');
    }
    // 2. Query the users current cart
    const [existingCartItem] = await context.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id }
      }
    });
    // 3. Check if that item is already in their cart and increment by 1 if it is
    if (existingCartItem) {
      console.log('This itme is already in their cart');
      return context.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        },
        info
      );
    }
    // 4. if its not create a fresh cart item for that user
    return context.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId }
          },
          item: {
            connect: { id }
          }
        }
      },
      info
    );
  },
  async removeFromCart(parent, args, context, info) {
    // 1. find the cart item
    const cartItem = await context.db.query.cartItem(
      {
        where: { id: args.id }
      },
      `{id, quantity, user {id}}`
    );
    if (!cartItem) {
      throw new Error('Bleeeeeeeeeeeeep');
    }
    // 2. make sure they own that cart item
    if (cartItem.user.id !== context.request.userId) {
      throw new Error('Cheatin huhhhh');
    }
    // 3. delete that cart item
    // if (cartItem.quantity > 1) {
    //   return context.db.mutation.updateCartItem(
    //     {
    //       where: { id: cartItem.id },
    //       data: { quantity: cartItem.quantity - 1 }
    //     },
    //     info
    //   );
    // }
    return context.db.mutation.deleteCartItem(
      {
        where: { id: args.id }
      },
      info
    );
  }
};

module.exports = mutations;
