import express from "express";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const serviceAccount = JSON.parse(process.env.FCM_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.post("/send", async (req, res) => {
  const { token, title, body } = req.body;
  try {
    const message = {
      token,
      notification: { title, body }
    };
    await admin.messaging().send(message);
    res.json({ success: true });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ FCM server running on port ${PORT}`));
