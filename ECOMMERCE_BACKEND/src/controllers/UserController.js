const UserService = require("../services/UserService");
const JWTService = require("../services/JWTService");

const ApplicationUser = require("../models/UserModel");
const createUser = async (req, res) => {
  try {
    const { fullName, email, passwordHash, confirmPassword, phone } = req.body;

    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isCheckEmail = reg.test(email);
    console.log("isCheckEmail", isCheckEmail);
    if (!email || !passwordHash) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is email",
      });
    } else if (passwordHash !== confirmPassword) {
      return res.status(200).json({
        status: "ERR",
        message: "The passwordHash is equal confirmPassword",
      });
    }

    const responseFromService = await UserService.createUser(req.body);
    return res.status(200).json(responseFromService);
  } catch (e) {
    console.error("CreateUser error:", e);
    return res.status(500).json({
      status: "ERR",
      message: e.message || e.toString(),
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, passwordHash } = req.body;
    if (!email || !passwordHash) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    }

    const responseFromService = await UserService.loginUser(req.body);
    const { refresh_token, ...newReponse } = responseFromService;
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // hoặc “none” nếu dùng https
      path: "/",
    });
    return res.status(200).json(newReponse);
  } catch (e) {
    return res.status(500).json({
      message: e.message || e, // show message thực sự
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id; // sửa lại id
    const data = req.body;

    if (!userId) {
      return res.status(400).json({
        // dùng 400 cho thiếu params
        status: "ERR",
        message: "The userId is required",
      });
    }

    const responseFromService = await UserService.updateUser(userId, data);
    return res.status(200).json(responseFromService);
  } catch (e) {
    console.error("Update user error:", e);
    return res.status(500).json({
      message: e.message || e,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const token = req.headers;

    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }

    const responseFromService = await UserService.deleteUser(userId);
    return res.status(200).json(responseFromService);
  } catch (e) {
    return res.status(500).json({
      message: e.message || e, // show message thực sự
    });
  }
};
const deleteMany = async (req, res) => {
  try {
    const ids = req.body;
    const token = req.headers;

    if (!ids) {
      return res.status(200).json({
        status: "ERR",
        message: "The ids is required",
      });
    }

    const responseFromService = await UserService.deleteManyUser(ids);
    return res.status(200).json(responseFromService);
  } catch (e) {
    return res.status(500).json({
      message: e.message || e, // show message thực sự
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const responseFromService = await UserService.getAllUser();
    return res.status(200).json(responseFromService);
  } catch (e) {
    return res.status(500).json({
      message: e.message || e,
    });
  }
};

const getDetailUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }

    const responseFromService = await UserService.getDetailUser(userId);
    return res.status(200).json(responseFromService);
  } catch (e) {
    return res.status(500).json({
      message: e.message || e, // show message thực sự
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;

    if (!token) {
      return res.status(401).json({
        status: "ERR",
        message: "The token is required",
      });
    }

    const responseFromService = await JWTService.refreshTokenJWTService(token);
    return res.status(200).json(responseFromService);
    return;
  } catch (e) {
    return res.status(500).json({
      message: e.message || e,
    });
  }
};

const lockoutUser = async (req, res) => {
  try {
    res.clearCookie("refresh_token");
    return res.status(200).json({
      status: "OK",
      message: "Logout Successfully",
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message || e,
    });
  }
};
const topUp = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền nạp không hợp lệ",
      });
    }

    const user = await ApplicationUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User không tồn tại",
      });
    }

    user.walletBalance = Number(user.walletBalance || 0) + Number(amount);
    await user.save();

    return res.json({
      success: true,
      message: `Nạp ${Number(amount).toLocaleString()} VND thành công`,
      balance: user.walletBalance,
    });
  } catch (err) {
    console.error("TOP-UP ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await ApplicationUser.findOne({
      emailVerifyToken: token,
      emailVerifyExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: "ERR",
        message: "Link xác thực không hợp lệ hoặc đã hết hạn",
      });
    }

    user.emailConfirmed = true;
    user.emailVerifyToken = null;
    user.emailVerifyExpire = null;
    await user.save();

    return res.json({
      status: "OK",
      message: "Xác thực email thành công",
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

const resendVerifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const now = Date.now();

    if (!email) {
      return res.status(400).json({
        status: "ERR",
        message: "Email is required",
      });
    }

    const user = await ApplicationUser.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "ERR",
        message: "Email chưa được đăng ký",
      });
    }

    if (user.emailConfirmed) {
      return res.json({
        status: "OK",
        message: "Email đã được xác thực",
      });
    }

    // ⏱️ Rate limit 60s
    if (
      user.lastVerifyEmailSentAt &&
      now - user.lastVerifyEmailSentAt.getTime() < 60 * 1000
    ) {
      const remain = Math.ceil(
        (60 * 1000 - (now - user.lastVerifyEmailSentAt.getTime())) / 1000
      );

      return res.status(429).json({
        status: "ERR",
        message: `Vui lòng thử lại sau ${remain}s`,
        remainSeconds: remain,
      });
    }

    // 🔐 tạo token mới
    const verifyToken = crypto.randomBytes(32).toString("hex");

    user.emailVerifyToken = verifyToken;
    user.emailVerifyExpire = now + 15 * 60 * 1000;
    user.lastVerifyEmailSentAt = now;
    await user.save();

    const verifyLink = `http://localhost:3000/verify-email?token=${verifyToken}`;
    const reason = "Bạn đã yêu cầu gửi lại email xác thực.";
    await sendEmailService({
      to: email,
      subject: "Gửi lại email xác thực tài khoản EventX",
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
  Chào <strong>${user.fullName}</strong>,
</p>


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

    return res.json({
      status: "OK",
      message: "Đã gửi lại email xác thực",
    });
  } catch (e) {
    console.error("Resend verify error:", e);
    return res.status(500).json({
      status: "ERR",
      message: "Lỗi server",
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailUser,
  refreshToken,
  lockoutUser,
  deleteMany,
  topUp,
  verifyEmail,
  resendVerifyEmail,
};
