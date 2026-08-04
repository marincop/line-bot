# LINE Official Account Chatbot (Node.js)

這是一個基於 Node.js + Express 繁體中文的 LINE 官方帳號機器人。它使用官方的 `@line/bot-sdk` (v9) 來接收並處理來自 LINE 的 Webhook 事件。

---

## 🛠️ 環境需求
- **Node.js**: v22+
- **ngrok**: 用於將本地端服務暴露至公網，方便 LINE 平台發送 Webhook（或者其他 Tunnel 工具如 Cloudflare Tunnel）。

---

## 🚀 快速開始

### 1. 設置環境變數
請將 `.env` 檔案中的預留欄位替換為您在 LINE Developers Console 取得的憑證：

```env
LINE_CHANNEL_ID=2010963956
LINE_CHANNEL_SECRET=您的_Channel_Secret
LINE_CHANNEL_ACCESS_TOKEN=您的_Channel_Access_Token
PORT=3000
```

### 2. 啟動伺服器
在專案目錄下運行以下指令啟動開發伺服器：

```bash
npm run dev
```

伺服器將在本地 `http://localhost:3000` 運行。

### 3. 使用 ngrok 進行外部對接
打開另一個終端機，執行：

```bash
ngrok http 3000
```

複製 ngrok 產生的 `https://xxxx.ngrok-free.app` 網址。

### 4. 設定 LINE Webhook
1. 進入 [LINE Developers Console](https://developers.line.biz/)。
2. 找到您的 **Messaging API Channel**。
3. 點選 **Messaging API** 頁面。
4. 找到 **Webhook URL** 並填入您的 ngrok 網址 + `/callback`，例如：
   `https://xxxx.ngrok-free.app/callback`
5. 點選 **Verify（驗證）**，確認顯示 **Success**。
6. 將下方 **Use webhook** 的開關設為 **ON（啟用）**。

---

## 🤖 互動指令測試
加入機器人好友後，嘗試傳送以下訊息：
- `你好` 或 `hello`：機器人會回覆歡迎訊息。
- `選單` 或 `menu`：機器人會發送一個漂亮的 Flex Message 互動式按鈕選單。
- 傳送其他任何文字：機器人會自動回傳（Echo）您說的內容。
