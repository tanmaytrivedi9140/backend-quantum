const Express = require('express')


const router = Express.Router();
const {
  genOtp,
  verifyOtp,
  RegisterUser,
  verifyemail,
  changepass,
  signin,
  jwtverify,
  userdata
} = require("../Controller/usercontroller");

router.post('/otp' , genOtp );
router.post('/register' ,verifyOtp , RegisterUser )
router.post('/verifyemail' , verifyemail);
router.post("/changepass", changepass);
router.post("/signin", signin);
router.get("/verify" , jwtverify , userdata)
module.exports = router; 