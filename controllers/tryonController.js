
// // backend/controllers/tryonController.js
// const axios = require("axios");

// const FASHN_API_URL = "https://api.fashn.ai/v1";
// const AUTH_HEADER = "Bearer fa-kGtS5NyR8vMR-KUYaqFfjeoCM7xBu9BI6aunh"; // Replace with your actual API key

// exports.handleTryOn = async (req, res) => {
//   console.log("TryOn request received");
//   console.log("Request body:", req.body);
  
//   const { modelImage, garmentImage } = req.body;

//   // Validate inputs
//   if (!modelImage || !garmentImage) {
//     console.log("Missing required fields:", { modelImage: !!modelImage, garmentImage: !!garmentImage });
//     return res.status(400).json({ 
//       error: "Both modelImage and garmentImage URLs are required." 
//     });
//   }

//   // Validate URLs
//   const urlRegex = /^https?:\/\/.+/;
//   if (!urlRegex.test(modelImage) || !urlRegex.test(garmentImage)) {
//     console.log("Invalid URL format");
//     return res.status(400).json({ 
//       error: "Both URLs must be valid HTTP/HTTPS URLs" 
//     });
//   }

//   try {
//     console.log("Sending request to FASHN API...");
//     console.log("Model Image URL:", modelImage);
//     console.log("Garment Image URL:", garmentImage);

//     // Make request to FASHN API
//     const runResponse = await axios.post(
//       `${FASHN_API_URL}/run`,
//       {
//         model_name: "tryon-v1.6",
//         inputs: {
//           model_image: modelImage,
//           garment_image: garmentImage,
//         },
//       },
//       {
//         headers: {
//           Authorization: AUTH_HEADER,
//           "Content-Type": "application/json",
//         },
//         timeout: 30000, // 30 second timeout
//       }
//     );

//     console.log("FASHN API response:", runResponse.data);
//     const predictionId = runResponse.data.id;

//     if (!predictionId) {
//       throw new Error("No prediction ID returned from FASHN API");
//     }

//     console.log("Polling for results with ID:", predictionId);

//     // Poll for results with better error handling
//     const pollStatus = async () => {
//       const maxAttempts = 15; // Increased from 10
//       const pollInterval = 3000; // 3 seconds

//       for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//         try {
//           console.log(`Polling attempt ${attempt}/${maxAttempts}`);
          
//           const statusResponse = await axios.get(
//             `${FASHN_API_URL}/status/${predictionId}`,
//             {
//               headers: {
//                 Authorization: AUTH_HEADER,
//               },
//               timeout: 10000, // 10 second timeout for status checks
//             }
//           );

//           const statusData = statusResponse.data;
//           console.log(`Status response (attempt ${attempt}):`, statusData);

//           if (statusData.status === "completed") {
//             if (statusData.output && statusData.output.length > 0) {
//               return res.status(200).json({ output: statusData.output });
//             } else {
//               return res.status(500).json({ 
//                 error: "Try-on completed but no output was generated" 
//               });
//             }
//           }

//           if (statusData.status === "failed") {
//             const errorMsg = statusData.error || "Try-on processing failed";
//             console.error("FASHN API failed:", errorMsg);
//             return res.status(500).json({ error: errorMsg });
//           }

//           if (statusData.status === "cancelled") {
//             return res.status(500).json({ error: "Try-on was cancelled" });
//           }

//           // If still processing, wait before next poll
//           if (attempt < maxAttempts) {
//             console.log(`Status: ${statusData.status}, waiting ${pollInterval}ms before next poll...`);
//             await new Promise((resolve) => setTimeout(resolve, pollInterval));
//           }

//         } catch (pollError) {
//           console.error(`Polling error on attempt ${attempt}:`, pollError.message);
          
//           // If this is the last attempt, return error
//           if (attempt === maxAttempts) {
//             return res.status(500).json({ 
//               error: "Failed to get try-on status after multiple attempts" 
//             });
//           }
          
//           // Otherwise, wait and try again
//           await new Promise((resolve) => setTimeout(resolve, pollInterval));
//         }
//       }

//       // If we've exhausted all attempts without success
//       return res.status(504).json({ 
//         error: "Try-on processing timed out. Please try again." 
//       });
//     };

//     await pollStatus();

//   } catch (err) {
//     console.error("TryOn error:", err);
    
//     // More detailed error handling
//     if (err.code === 'ECONNREFUSED') {
//       return res.status(500).json({ 
//         error: "Cannot connect to try-on service. Please try again later." 
//       });
//     }
    
//     if (err.code === 'ETIMEDOUT') {
//       return res.status(504).json({ 
//         error: "Try-on service timed out. Please try again." 
//       });
//     }

//     if (err.response) {
//       console.error("API Error Response:", err.response.data);
//       const errorMsg = err.response.data?.error || err.response.data?.message || "API request failed";
//       return res.status(err.response.status || 500).json({ error: errorMsg });
//     }

//     res.status(500).json({ 
//       error: err.message || "An unexpected error occurred during try-on processing" 
//     });
//   }
// };






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


























































