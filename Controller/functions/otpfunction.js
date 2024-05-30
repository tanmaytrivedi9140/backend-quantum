const nodemailer = require("nodemailer");

exports.transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,

  service: "Gmail",

  auth: {
    user: "tanmaytrivedi57@gmail.com",
    pass: "rnwr liqe tmyk urco",
  },
});
