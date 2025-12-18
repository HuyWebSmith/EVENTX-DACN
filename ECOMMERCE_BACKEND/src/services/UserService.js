const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken } = require("./JWTService");
const { refreshToken } = require("../controllers/UserController");
const crypto = require("crypto");

const sendEmailService = require("../services/EmailService");

const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!newUser) {
        return reject("newUser is undefined");
      }

      const { fullName, email, passwordHash, confirmPassword, phone } = newUser;
      const checkUser = await User.findOne({
        email: email,
      });
      if (checkUser) {
        return resolve({
          status: "ERR",
          message: "The email is already registered",
          data: null,
        });
      }

      if (!fullName || !email || !passwordHash || !confirmPassword) {
        return reject("Missing required fields");
      }
      const verifyToken = crypto.randomBytes(32).toString("hex");
      const verifyExpire = Date.now() + 15 * 60 * 1000;

      const hash = bcrypt.hashSync(passwordHash, 10);
      const createdUser = await User.create({
        fullName,
        email,
        passwordHash: hash,
        phone,

        emailConfirmed: false,
        emailVerifyToken: verifyToken,
        emailVerifyExpire: verifyExpire,
      });
      const verifyLink = `http://localhost:3000/verify-email?token=${verifyToken}`;
      const reason =
        "Cảm ơn bạn đã đăng ký tài khoản EventX. Vui lòng xác thực email để kích hoạt tài khoản.";

      const mailResult = await sendEmailService({
        to: email,
        subject: "Xác thực email tài khoản EventX",

        html: `
<div style="
  max-width:520px;
  margin:0 auto;
  padding:24px;
  font-family:Arial,Helvetica,sans-serif;
  background:#ffffff;
  border:1px solid #e5e7eb;
  border-radius:8px;
">

  <h2 style="
    text-align:center;
    color:#111827;
    margin-bottom:16px;
  ">
    Xác thực email EventX
  </h2>

  <p style="color:#374151;font-size:14px;line-height:1.6">
  Chào <strong>${createdUser.fullName}</strong>,
</p>


  <p style="color:#374151;font-size:14px;line-height:1.6">
    ${reason}
  </p>

  <div style="text-align:center;margin:24px 0">
    <a href="${verifyLink}"
      style="
        display:inline-block;
        padding:12px 28px;
        background:#2563eb;
        color:#ffffff;
        text-decoration:none;
        font-size:14px;
        font-weight:600;
        border-radius:6px;
      ">
      Xác thực email
    </a>
  </div>

  <p style="color:#6b7280;font-size:13px">
    Liên kết này sẽ hết hạn sau <strong>15 phút</strong>.
  </p>

  <p style="color:#6b7280;font-size:12px">
    Hoặc sao chép link sau vào trình duyệt:<br/>
    <span style="word-break:break-all">${verifyLink}</span>
  </p>

  <p style="color:#6b7280;font-size:13px">
    Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
  </p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>

  <p style="
    color:#9ca3af;
    font-size:12px;
    text-align:center;
  ">
    © ${new Date().getFullYear()} EventX. All rights reserved.
  </p>
</div>
`,
      });
      if (!mailResult.success) {
        console.error("Send verify email failed");
      }
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: createdUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userLogin) {
        return reject("userLogin is undefined");
      }

      const { email, passwordHash } = userLogin;

      if (!email || !passwordHash) {
        return reject("Missing required fields");
      }

      const checkUser = await User.findOne({ email });
      if (!checkUser) {
        return resolve({
          status: "ERR",
          message: "Email chưa được đăng ký",
          data: null,
        });
      }
      if (!checkUser.emailConfirmed) {
        if (
          !checkUser.lastVerifyEmailSentAt ||
          Date.now() - checkUser.lastVerifyEmailSentAt > 60000
        ) {
          const token = crypto.randomBytes(32).toString("hex");

          checkUser.emailVerifyToken = token;
          checkUser.emailVerifyExpire = Date.now() + 15 * 60 * 1000;
          checkUser.lastVerifyEmailSentAt = Date.now();
          await checkUser.save();

          const verifyLink = `http://localhost:3000/verify-email?token=${token}`;
          const reason =
            "Bạn vừa đăng nhập nhưng email của bạn chưa được xác thực.";
          await sendEmailService({
            to: checkUser.email,
            subject: "Xác thực email EventX",
            html: `
<div style="
  max-width:520px;
  margin:0 auto;
  padding:24px;
  font-family:Arial,Helvetica,sans-serif;
  background:#ffffff;
  border:1px solid #e5e7eb;
  border-radius:8px;
">

  <h2 style="
    text-align:center;
    color:#111827;
    margin-bottom:16px;
  ">
    Xác thực email EventX
  </h2>

  <p style="color:#374151;font-size:14px;line-height:1.6">
    Chào <strong>${checkUser.fullName}</strong>,

  </p>

  <p style="color:#374151;font-size:14px;line-height:1.6">
    ${reason}
  </p>

  <div style="text-align:center;margin:24px 0">
    <a href="${verifyLink}"
      style="
        display:inline-block;
        padding:12px 28px;
        background:#2563eb;
        color:#ffffff;
        text-decoration:none;
        font-size:14px;
        font-weight:600;
        border-radius:6px;
      ">
      Xác thực email
    </a>
  </div>

  <p style="color:#6b7280;font-size:13px">
    Liên kết này sẽ hết hạn sau <strong>15 phút</strong>.
  </p>

  <p style="color:#6b7280;font-size:12px">
    Hoặc sao chép link sau vào trình duyệt:<br/>
    <span style="word-break:break-all">${verifyLink}</span>
  </p>

  <p style="color:#6b7280;font-size:13px">
    Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
  </p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>

  <p style="
    color:#9ca3af;
    font-size:12px;
    text-align:center;
  ">
    © ${new Date().getFullYear()} EventX. All rights reserved.
  </p>
</div>
`,
          });
        }

        return resolve({
          status: "ERR",
          code: "EMAIL_NOT_VERIFIED",
          message:
            "Email chưa xác thực. Chúng tôi đã gửi lại email xác thực cho bạn.",
        });
      }

      const comparePassword = bcrypt.compareSync(
        passwordHash,
        checkUser.passwordHash
      );

      if (!comparePassword) {
        return resolve({
          status: "ERR",
          message: "Mật khẩu hoặc user không chính xác",
          data: null,
        });
      }

      const access_token = await generalAccessToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });
      const refresh_token = await generalRefreshToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });

      return resolve({
        status: "OK",
        message: "SUCCESS",
        access_token,
        refresh_token,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({ _id: id });

      if (checkUser === null) {
        return resolve({
          status: "ERR",
          message: "The user is not defined",
          data: null,
        });
      }
      const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
      return resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({ _id: id });

      if (checkUser === null) {
        return resolve({
          status: "ERR",
          message: "The user is not defined",
          data: null,
        });
      }
      await User.findByIdAndDelete(id);
      return resolve({
        status: "OK",
        message: "DELETE USER SUCCESS",
      });
    } catch (e) {
      reject(e);
    }
  });
};
const deleteManyUser = (ids) => {
  return new Promise(async (resolve, reject) => {
    try {
      await User.deleteMany({ _id: ids });
      return resolve({
        status: "OK",
        message: "DELETE USER SUCCESS",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allUser = await User.find();
      return resolve({
        status: "OK",
        message: "SUCCESS",
        data: allUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getDetailUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({ _id: id });

      if (user === null) {
        return resolve({
          status: "ERR",
          message: "The user is not defined",
          data: null,
        });
      }

      return resolve({
        status: "OK",
        message: "FINDING USER SUCCESS",
        data: user,
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailUser,
  deleteManyUser,
};
