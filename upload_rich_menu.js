require('dotenv').config();
const fs = require('fs');
const path = require('path');
const line = require('@line/bot-sdk');

const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

if (!accessToken) {
  console.error('Error: LINE_CHANNEL_ACCESS_TOKEN is missing in .env file.');
  process.exit(1);
}

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: accessToken
});

const blobClient = new line.messagingApi.MessagingApiBlobClient({
  channelAccessToken: accessToken
});

// Configure the Rich Menu
const richMenuConfig = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: "Consulting Rich Menu",
  chatBarText: "服務選單",
  areas: [
    // Left Top (AI)
    {
      bounds: { x: 0, y: 0, width: 833, height: 843 },
      action: { type: "message", text: "AI" }
    },
    // Middle Top (System)
    {
      bounds: { x: 833, y: 0, width: 833, height: 843 },
      action: { type: "message", text: "系統" }
    },
    // Right Top (POS)
    {
      bounds: { x: 1666, y: 0, width: 834, height: 843 },
      action: { type: "message", text: "POS" }
    },
    // Left Bottom (Portfolio URL) - Update the URL here!
    {
      bounds: { x: 0, y: 843, width: 1250, height: 843 },
      action: { type: "uri", uri: "https://app.notion.com/p/cd57c0f3922c4a329fc15edaefc6f091?source=copy_link" }
    },
    // Right Bottom (Keyword "預約諮詢")
    {
      bounds: { x: 1250, y: 843, width: 1250, height: 843 },
      action: { type: "message", text: "預約諮詢" }
    }
  ]
};

async function uploadRichMenu() {
  try {
    console.log("1. Creating Rich Menu definition...");
    const { richMenuId } = await client.createRichMenu(richMenuConfig);
    console.log(`Successfully created rich menu definition. ID: ${richMenuId}`);

    console.log("2. Uploading Rich Menu image...");
    const imagePath = "/Users/albert/.gemini/antigravity/brain/b4396c0f-8749-458e-9c03-439fbab8d3e4/rich_menu_completed.jpg";
    
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Rich menu image file not found at: ${imagePath}`);
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    const blob = new Blob([imageBuffer], { type: "image/jpeg" });
    await blobClient.setRichMenuImage(richMenuId, blob);
    console.log("Successfully uploaded Rich Menu image.");

    console.log("3. Setting Rich Menu as default...");
    await client.setDefaultRichMenu(richMenuId);
    console.log("Successfully set Rich Menu as default!");
    
    console.log("\nDone! Please open your LINE app and check your Official Account chat room.");
  } catch (error) {
    console.error("Error creating/uploading Rich Menu:");
    console.log("Keys of error:", Object.keys(error));
    console.log("Error properties: message=", error.message, ", statusCode=", error.statusCode, ", status=", error.status);
    if (error.body) {
      console.log("Body:", typeof error.body === 'string' ? error.body : JSON.stringify(error.body, null, 2));
    }
  }
}

uploadRichMenu();
