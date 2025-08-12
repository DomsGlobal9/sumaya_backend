//dummy

// backend/controllers/tryonController.js
const axios = require("axios");

const FASHN_API_URL = "https://api.fashn.ai/v1";
const AUTH_HEADER = "Bearer fa-kGtS5NyR8vMR-KUYaqFfjeoCM7xBu9BI6aunh"; // ✅ Replace with your actual API key

exports.handleTryOn = async (req, res) => {
  const { modelImage, garmentImage } = req.body;

  if (!modelImage || !garmentImage) {
    return res.status(400).json({ error: "Both modelImage and garmentImage URLs are required." });
  }

  try {
    console.log("Received modelImage:", modelImage);
    console.log("Received garmentImage:", garmentImage);

    const runResponse = await axios.post(
      `${FASHN_API_URL}/run`,
      {
        model_name: "tryon-v1.6",
        inputs: {
          model_image: modelImage,
          garment_image: garmentImage,
        },
      },
      {
        headers: {
          Authorization: AUTH_HEADER,
          "Content-Type": "application/json",
        },
      }
    );

    const predictionId = runResponse.data.id;

    const pollStatus = async () => {
      for (let i = 0; i < 10; i++) {
        const statusResponse = await axios.get(
          `${FASHN_API_URL}/status/${predictionId}`,
          {
            headers: {
              Authorization: AUTH_HEADER,
            },
          }
        );

        const statusData = statusResponse.data;

        if (statusData.status === "completed") {
          return res.status(200).json({ output: statusData.output });
        }

        if (statusData.status === "failed") {
          return res.status(500).json({ error: statusData.error || "Try-on failed." });
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      return res.status(504).json({ error: "Try-on timed out." });
    };

    await pollStatus();

  } catch (err) {
    console.error("TryOn error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || "Something went wrong." });
  }
};
