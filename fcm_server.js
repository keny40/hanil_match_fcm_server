import express from "express";
import admin from "firebase-admin";

const app = express();
app.use(express.json());

// Render 환경변수로부터 Firebase 인증키 로드
const serviceAccount = JSON.parse(process.env.FCM_SERVICE_ACCOUNT_KEY);

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("🔥 Firebase Admin Initialized");
}

// 기본 루트 (브라우저에서 직접 접속 시)
app.get("/", (req, res) => {
  res.send("✅ Hanil Match FCM Server is running");
});

// FCM 푸시 메시지 전송 엔드포인트
app.post("/send", async (req, res) => {
  try {
    const { token, title, body } = req.body;

    if (!token || !title || !body) {
      return res.status(400).json({
        success: false,
        message: "token, title, body 모두 필요합니다.",
      });
    }

    const message = {
      notification: {
        title,
        body,
      },
      token,
    };

    const response = await admin.messaging().send(message);
    console.log("📤 메시지 전송 성공:", response);

    return res.json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error("❌ FCM 전송 오류:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Render 기본 포트 설정
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ FCM server running on port ${PORT}`);
});
