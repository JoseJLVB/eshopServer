"use strict";
const stripe = require("stripe")(
  "sk_test_51NkG90GQs93uUYOSeXrD2LnQtJ4lRni9dfdrEKDZKVuUgHNmEIsvCV8nopYAPafp9XYxfhuDUONOsLtzuUL2OEAH00QRvPflVf"
);

function calcDiscountPrice(price, discount) {
  if (!discount) return price;

  const discountAmount = (price * discount) / 100;
  const result = price - discountAmount;

  return result.toFixed(2);
}
/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async paymentOrder(ctx) {
    const { token, products, userId, addressShipping } = ctx.request.body;

    let totalPayment = 0;
    products.forEach((product) => {
      const priceTemp = calcDiscountPrice(product.price, product.discount);
      totalPayment += Number(priceTemp) * product.quantity;
    });

    const charge = await stripe.charge.create({
      amount: Math.round(totalPayment * 100),
      currency: "USD",
      source: token,
      descritption: `User ID: ${userID}`,
    });

    const data = {
      products,
      user: userID,
      totalPayment: totalPayment,
      idPayment: charge.id,
      addressShipping,
    };

    const model = strapi.contentTypes["api::order.order"];
    const validData = await strapi.entityValidator.validateEntityCreation(
      model,
      data
    );

    const entry = await strapi.db
      .query("api::order.order")
      .create({ data: validData });

    return entry;
  },
}));
