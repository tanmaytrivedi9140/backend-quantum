const express = require("express");
require("dotenv").config();
const asynchandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const { transporter } = require("./functions/otpfunction");
const otpschema = require("../Models/OtpSchema");
const userschema = require("../Models/UserSchema");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let userData;
let prevotp;
// register the user
exports.RegisterUser = asynchandler(async (req, res) => {
  const { email } = req.data;
  console.log(email);
  const userexist = await userschema.findOne({ email: email });
  console.log(userexist);
  console.log(userData);
  if (userexist) {
    res.status(200).send({
      user: true,
      message: "user already registered",
      success: false,
    });
  }
  try {
    const {  name, password , date } = req.data;
    console.log(date, name, password);
    const user = new userschema({
      username: name,
      email: email,
      date: date,
      password: password,
    });
    console.log(user);
    const newuser = await user.save();
    console.log(newuser);
    res.status(200).send({
      message: "user successfully registered",
      success: true,
    });
  } catch (error) {
    res.status(200).send({
      message: "network Error",
      success: false,
    });
  }
});

// send otp
exports.genOtp = asynchandler(async (req, res) => {
  const { email, date, name, password } = req.body;
  console.log(email);
  try {
    console.log(email);
    const user = await otpschema.findOne({ email: email });
    console.log(user);
    if (user) {
      res.status(200).send({
        success: false,
        user: true,
        message: "user already registered",
      });
    }
    prevotp = Math.floor(100000 + Math.random() * 900000).toString();
    const preotp = new otpschema({
      otp: prevotp,
      email: email,
      date: date,
    });

    mailOptions = {
      to: email,
      subject: "Otp for registration is: ",
      html:
        "<h3>OTP for account verification is </h3>" +
        "<h1 style='font-weight:bold;'>" +
        prevotp +
        "</h1>",
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.status(200).send({
          success: false,
          message: "Error transporter",
        });
        return console.log(error);
      }
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    });

    const savedotp = await preotp.save();
    console.log(savedotp);
    res.status(200).send({
      success: true,
      message: "otp send successfully",
      email: email,
    });
    console.log(userData);
    console.log(prevotp);
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Error occoured",
    });
  }
});

// verify otp
exports.verifyOtp = asynchandler(async (req, res, next) => {
  const { otp, email, date, password, name } = req.body;
  const newpass = await bcrypt.hash(password, 10);
  console.log(email);
  const user = await otpschema.findOne({ email: email });
  console.log(user);
  if (!user) {
    res.status(200).send({
      user: false,
      message: "user not registered",
      success: false,
    });
  }
  const prevotp = user.otp;
  console.log(prevotp == otp);
  try {
    if (otp == prevotp) {
      req.data = {
        email: email,
        date: date,
        password: newpass,
        name: name,
      };
      next();
    } else {
      res.status(200).send({
        message: "otp error",
        success: false,
      });
    }
  } catch (error) {}
});


exports.verifyemail = asynchandler(async (req, res) => {
  const { email } = req.body;
  const user = await userschema.findOne({ email: email });
  console.log(user);
  if (!user) {
    res.status(200).send({
      message: "please enter registed email",
      success: false,
    });
  }
  try {
    if (user) {
      res.status(200).send({
        message: "email verified succesfully",
        success: true,
      });
    } else {
      res.status(200).send({
        message: "No such user found",
        success: false,
      });
    }
  } catch (error) {
    res.status(200).send({
      message: "error",
      success: false,
    });
  }
});

exports.changepass = asynchandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const newpass = await bcrypt.hash(password, 10);
    const user = await userschema.findOneAndUpdate(
      { email: email },
      { password: newpass },
      { new: true }
    );
    console.log(user);
    res.status(200).send({
      message: "password updated successfully",
      success: true,
    });
  } catch (error) {
    res.status(200).send({
      message: "error",
      success: false,
    });
  }
});

exports.signin = asynchandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userschema.findOne({ email: email });
    console.log(user);
    if (!user) {
      res.status(200).send({
        message: "No such user",
        success: false,
      });
    }
    const pass = user.password;
    const comparepass = await bcrypt.compare(password, pass);
    console.log(comparepass);
    if (comparepass) {
     const token = jwt.sign(
       { id: user._id, date: user.date, email: user.email },
       `userlogin`,
       {
         expiresIn: "1d",
       }
     );
     res.status(200).send({
       message: "login success",
       token: token,
       success: true,
     });
    } else {
      res.status(200).send({
        message: "incorrect password",
        password: false,
        success: false,
      });
    }
    console.log(user);
  } catch (error) {
    res.status(200).send({
      message: "error",
      success: false,
    });
  }
});
exports.jwtverify = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log(token)
  if (!token) {
    res.status(400).send("Authentication required.");
    return;
  }
   console.log(process.env.JWT);
  jwt.verify(token, `userlogin`, (err, decoded) => {
    if (err) {
      res.status(200).send({ success: false });
      return;
    }
    console.log(decoded);
    req.body = decoded;
    next();
  });
};
exports.userdata = async (req, res) => {
  res.send({ data: req.body });
};