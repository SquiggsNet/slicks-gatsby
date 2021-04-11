const nodemailer = require('nodemailer');

function generateOrderEmail({ order, total }) {
  return `
    <div>
      <h2>Your Recent Order for ${total}</h2>
      <p>Please start walking over, we will have you order ready in the next 20 mins.</p>
      <ul>
        ${order
          .map(
            (item) => `<li>
          <img src="${item.thumbnail}" alt="${item.name}" />
          ${item.size} ${item.name} - ${item.price}
        </li>`
          )
          .join('')}
      </ul>
      <p>Your total is <strong>$${total}</strong> due at pickup</p>
      <style>
          ul {
            list-style: none;
          }
      </style>
    </div>
  `;
}

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 587,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);
  if (body.mapleSyrop) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Boop beep bop zzzzsstt good bye!',
      }),
    };
  }
  const requiredFields = ['email', 'name', 'order'];
  for (const field of requiredFields) {
    if (!body[field]) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Ooop! You are missing the ${field} field`,
        }),
      };
    }
  }
  const { order } = body;
  if (!order.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Why would you order nothing?',
      }),
    };
  }

  const info = await transporter.sendMail({
    from: "Slick's Slices <slick@example.com>",
    to: `${body.name} <${body.email}>, orders@example.com`,
    subject: 'New Order!',
    html: generateOrderEmail({ order, total: body.total }),
  });
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' }),
  };
};
