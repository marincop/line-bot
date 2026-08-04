require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const path = require('path');


const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || ''
});

const app = express();

// Serve static images from brain folder
app.use('/media', express.static('/Users/albert/.gemini/antigravity/brain/b4396c0f-8749-458e-9c03-439fbab8d3e4'));

// A simple GET endpoint for browser test
app.get('/', (req, res) => {
  res.send('LINE Bot Webhook Server is running successfully!');
});

app.get('/callback', (req, res) => {
  res.send('LINE Bot Webhook Server is active! (Note: LINE Webhook uses HTTP POST, not HTTP GET)');
});

// Serve the consultation booking form page
app.get('/consultation', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'consultation.html'));
});

// Handle consultation form submission
app.post('/submit-consultation', express.json(), async (req, res) => {
  const { name, company, phone, email, services, notes } = req.body;

  if (!name || !phone || !email || !services) {
    return res.status(400).json({ status: 'error', message: '必要欄位未填寫完整！' });
  }

  const host = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

  // 1. Send Email notification to marincop@gmail.com using FormSubmit AJAX API
  try {
    const emailRes = await fetch('https://formsubmit.co/ajax/marincop@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Referer': host,
        'Origin': host
      },
      body: JSON.stringify({
        name,
        company: company || '無',
        phone,
        email,
        services,
        notes: notes || '無',
        _subject: `📩 新預約諮詢申請: ${name} (${company || '個人'})`
      })
    });
    const emailData = await emailRes.json();
    console.log('FormSubmit Email response:', emailData);
  } catch (err) {
    console.error('Failed to send Email notification via FormSubmit:', err);
  }

  // 2. Send LINE push notification to admin
  const adminId = process.env.ADMIN_LINE_USER_ID;
  if (adminId) {
    try {
      await client.pushMessage({
        to: adminId,
        messages: [
          {
            type: 'text',
            text: `📩 【收到新預約諮詢通知】\n\n👤 聯絡人: ${name}\n🏢 公司: ${company || '無'}\n📞 電話: ${phone}\n✉️ Email: ${email}\n🛠️ 諮詢項目: ${services}\n📝 需求說明:\n${notes || '無'}`
          }
        ]
      });
      console.log('LINE push notification sent to admin successfully.');
    } catch (err) {
      console.error('Failed to send LINE push notification to admin:', err);
    }
  }

  return res.json({ status: 'success', message: '預約已送出！' });
});


// Webhook callback endpoint
app.post('/callback', line.middleware(config), (req, res) => {
  // Extract external host (e.g. serveo URL), fall back to request header if not set
  const host = process.env.APP_URL || process.env.COOLIFY_URL || `${req.protocol}://${req.get('host')}`;
  Promise
    .all(req.body.events.map(event => handleEvent(event, host)))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error('Error handling events:', err);
      res.status(500).end();
    });
});

// Basic event handler
async function handleEvent(event, host) {
  // We only care about message events of type text
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const userMessage = event.message.text.trim();
  console.log(`Received message: "${userMessage}" from user: ${event.source.userId}`);

  // Custom responses based on keywords
  const messageLower = userMessage.toLowerCase();
  
  if (messageLower === 'hello' || userMessage === '你好') {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: '您好！歡迎與我們聯繫。💼\n我們是您的數位轉型技術顧問。\n\n請點選下方的「服務選單」圖文選單，了解我們的 AI 導入、軟體開發與物聯網解決方案！'
        }
      ]
    });
  }

  // 1. AI 自動化導入
  if (messageLower === 'ai' || userMessage.includes('自動化') || userMessage.includes('智駕') || userMessage.includes('整合')) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: '🤖 【AI 智能整合方案：建構您的數位員工隊伍】\n\n在這個 AI 驅動的時代，我們不只為您串接 API，更協助您將 AI 深度融入核心業務場景，打造 24/7 不間斷運作的「數位員工」：\n\n💡 核心落地場景與技術架構：\n\n1. OpenClaw 智能代理導入 (Agentic Workflows)\n• 功能：超越一般一問一答。我們的 AI 代理能自主理解複雜任務（如：自動寫信、安排行程、審核合約、抓取網路數據），自動拆解並執行多步驟流程。\n• 效益：省去 80% 的日常行政與重複性作業。\n\n2. 企業私有知識庫整合 (RAG 架構)\n• 功能：安全整合您企業的內部文件（PDF, Word, Excel），讓 AI 成為最懂您公司業務的知識專家。\n• 效益：新進人員培訓、內部業務速查、客服 FAQ，均可在 1 秒內獲得精準解答，拒絕 AI 胡言亂語。\n\n3. 全自動化流程串接 (RPA & API Integration)\n• 功能：無縫對接您現有的營運軟體（進銷存、CRM、Slack、LINE）。例如 LINE 收到詢價後，AI 自動計算庫存與報價並發送通知。\n• 效益：打破資訊孤島，跨系統資料零時差同步。\n\n4. 數據隱私與安全策略 (Enterprise Security)\n• 承諾：提供私有化部署（On-Premise）與資料去識別化技術諮詢，確保您公司的商業機密不會外洩。\n\n--- \n💡 想了解您的業務適合哪種 AI 落地架構嗎？\n👉 請點擊右下角「預約諮詢」，我們將安排技術顧問為您評估！'
        }
      ]
    });
  }

  // 2. 企業客製軟體
  if (messageLower === '系統' || userMessage.includes('軟體') || messageLower === 'system') {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: '💻 【數位轉型與客製軟體開發】\n\n不論是雲端系統還是內部工具，我們為您打造 100% 契合的營運核心：\n\n• 打卡差勤與 HR 系統：支援複雜排班、線上請假與考勤自動統計。\n• 採買進銷存與 WMS 管理：即時庫存預警、多倉庫管理與採購分析。\n• 資料庫建置與優化維護：設計高併發、高安全性的雲端資料庫架構。\n\n💡 準備好將繁瑣的 Excel 流程升級為自動化系統了嗎？\n👉 請點選右下角「預約諮詢」！'
        }
      ]
    });
  }

  // 3. 門市與物聯網
  if (messageLower === 'pos' || userMessage.includes('物聯網') || messageLower === 'rfid') {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: '🛒 【物聯網與智慧門市整合 (POS/RFID)】\n\n打破虛實邊界，實現軟體與終端硬體的無縫協同：\n\n• RFID 智慧倉儲盤點：一秒盤點整箱貨品，出入庫感應全自動，庫存準確率達 99%。\n• 客製化 POS 收銀系統：針對特定行業流程客製，支援多元支付與會員積點。\n• 邊緣計算與硬體串接：整合掃描槍、標籤列印機及各類工業感測器。\n\n💡 想了解物聯網技術如何解決您的實體營運痛點？\n👉 請點選右下角「預約諮詢」！'
        }
      ]
    });
  }

  // 4. 預約諮詢
  if (userMessage === '預約諮詢' || userMessage.includes('諮詢') || userMessage.includes('預約')) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'flex',
          altText: '預約專人技術諮詢',
          contents: {
            type: 'bubble',
            hero: {
              type: 'image',
              url: `${host}/media/consulting_logo_1785840239971.jpg`,
              size: 'full',
              aspectRatio: '1.51:1',
              aspectMode: 'cover'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '💼 專屬技術諮詢預約',
                  weight: 'bold',
                  size: 'lg',
                  color: '#1e3a8a'
                },
                {
                  type: 'text',
                  text: '一對一規劃您的數位轉型藍圖',
                  weight: 'bold',
                  size: 'sm',
                  color: '#6b7280',
                  margin: 'xs'
                },
                {
                  type: 'text',
                  text: '為能提供您最專業的評估，請點擊下方按鈕填寫簡要的需求表單。我們將安排專案負責人在第一時間為您進行評估與回覆。',
                  size: 'sm',
                  color: '#4b5563',
                  margin: 'md',
                  wrap: true
                }
              ]
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              spacing: 'sm',
              contents: [
                {
                  type: 'button',
                  style: 'primary',
                  color: '#1e3a8a',
                  action: {
                    type: 'uri',
                    label: '📋 填寫預約表單',
                    uri: `${host}/consultation`
                  }
                }
              ]
            }
          }
        }
      ]
    });
  }


  // 5. 最新貼文 (小龍蝦股票分析師)
  if (userMessage === '最新貼文' || userMessage.includes('貼文') || userMessage.includes('小龍蝦') || userMessage.includes('分析師')) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'flex',
          altText: '最新貼文：用 OpenClaw 打造 AI 股票分析師',
          contents: {
            type: 'bubble',
            hero: {
              type: 'image',
              url: `${host}/media/crawfish_analyst_1785840816386.jpg`,
              size: 'full',
              aspectRatio: '1:1',
              aspectMode: 'cover'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '🔥 最新實戰貼文',
                  color: '#139488',
                  size: 'sm',
                  weight: 'bold'
                },
                {
                  type: 'text',
                  text: '用 OpenClaw 打造專屬 AI 股票分析師',
                  weight: 'bold',
                  size: 'lg',
                  margin: 'md',
                  wrap: true
                },
                {
                  type: 'text',
                  text: '想讓 AI 自動盯盤、分析財報並生成策略？透過 OpenClaw 智能代理架構，三步驟建立專屬分析師：1.數據對接：自動抓取即時股價。2.精準大腦：對接 RAG 專業投資指標。3.定時回報：收盤後主動推送診斷報告！',
                  size: 'sm',
                  color: '#666666',
                  margin: 'md',
                  wrap: true
                }
              ]
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              spacing: 'sm',
              contents: [
                {
                  type: 'button',
                  style: 'primary',
                  color: '#139488',
                  action: {
                    type: 'message',
                    label: '立即預約 1對1 諮詢',
                    text: '預約諮詢'
                  }
                }
              ]
            }
          }
        }
      ]
    });
  }

  // 6. 安裝特價優惠
  if (userMessage.includes('安裝') || userMessage.includes('特價') || userMessage.includes('保固') || userMessage.includes('2499') || userMessage.includes('4990')) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'flex',
          altText: '限時特惠：系統安裝服務特價中',
          contents: {
            type: 'bubble',
            hero: {
              type: 'image',
              url: `${host}/media/install_promo_1785841203734.jpg`,
              size: 'full',
              aspectRatio: '1:1',
              aspectMode: 'cover'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '⚡ 限時特惠活動中',
                  color: '#139488',
                  size: 'sm',
                  weight: 'bold'
                },
                {
                  type: 'text',
                  text: '專業軟體與系統安裝環境建置',
                  weight: 'bold',
                  size: 'lg',
                  margin: 'md',
                  wrap: true
                },
                {
                  type: 'text',
                  text: '【系統安裝特價中！🛠️】原價 4,990 元，限時特價 2,499 元（不含硬體），加碼再送 3 個月完善保固！告別繁瑣系統與 AI 部署設定，交給專業團隊，即刻啟用！',
                  size: 'sm',
                  color: '#666666',
                  margin: 'md',
                  wrap: true
                }
              ]
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              spacing: 'sm',
              contents: [
                {
                  type: 'button',
                  style: 'primary',
                  color: '#139488',
                  action: {
                    type: 'message',
                    label: '立即預約安裝對接',
                    text: '預約諮詢'
                  }
                }
              ]
            }
          }
        }
      ]
    });
  }

  // 7. 小龍蝦股市大賺錢實績
  if (userMessage.includes('賺錢') || userMessage.includes('淨賺') || userMessage.includes('50000') || userMessage.includes('五萬美金')) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'flex',
          altText: 'AI 實戰奇蹟：OpenClaw 助客戶 2 天淨賺 $50,000 美金',
          contents: {
            type: 'bubble',
            hero: {
              type: 'image',
              url: `${host}/media/openclaw_wealth_1785841400820.jpg`,
              size: 'full',
              aspectRatio: '1:1',
              aspectMode: 'cover'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '💰 實戰成果捷報',
                  color: '#139488',
                  size: 'sm',
                  weight: 'bold'
                },
                {
                  type: 'text',
                  text: 'OpenClaw 助客戶 2 天淨賺 5 萬美金',
                  weight: 'bold',
                  size: 'lg',
                  margin: 'md',
                  wrap: true
                },
                {
                  type: 'text',
                  text: '【AI奇蹟！💰】這不是神話，是AI精準決策的威力！我們客戶日前導入 OpenClaw 智能代理，透過對接全球股市API與市場即時情緒分析。系統在波動中自主研判多空，精準捕捉突破買點，協助客戶在短短 2 天內斬獲 50,000 美元淨利！',
                  size: 'sm',
                  color: '#666666',
                  margin: 'md',
                  wrap: true
                }
              ]
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              spacing: 'sm',
              contents: [
                {
                  type: 'button',
                  style: 'primary',
                  color: '#139488',
                  action: {
                    type: 'message',
                    label: '預約顧問量身規劃',
                    text: '預約諮詢'
                  }
                }
              ]
            }
          }
        }
      ]
    });
  }

  if (userMessage === '選單' || userMessage === 'menu') {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: '📱 您可以直接點選對話框底部的「服務選單」進行互動！\n如果您的選單被收起來了，請點選最下方的「服務選單」字樣將它拉起。'
        }
      ]
    });
  }

  // 預設使用 Gemini AI 大腦進行人性化回覆
  try {
    const aiResponse = await askGemini(userMessage);
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: aiResponse
        }
      ]
    });
  } catch (err) {
    console.error('Failed to generate Gemini response:', err);
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: `已收到您的訊息："${userMessage}"。我們將盡快指派專人與您聯繫！`
        }
      ]
    });
  }
}

// Ask Gemini API helper
async function askGemini(userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not defined.');
    return '抱歉，我的 AI 大腦暫時無法連線。請聯絡管理員確認 API Key 設定！';
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const systemInstruction = `你是一位親切、專業且溫暖的 AI 助理，代表「數位轉型與 AI 技術顧問」公司（簡稱顧問特助）。
你必須使用台灣繁體中文對話，協助解答顧客關於軟體開發、AI 導入、RFID/POS 系統等技術與商務問題。
你的終極目標是：引導有高度意願的顧客在對話中打字輸入「預約諮詢」，或引導他們前往預約表單。

服務資訊參考：
- AI 智能整合：自主代理（OpenClaw 框架）、企業私有知識庫（RAG）。
- 客製軟體開發：打卡考勤系統、進銷存管理系統、雲端資料庫建置。
- 物聯網智慧門市：RFID 快速倉儲盤點、客製化 POS 機整合。
- 限時特惠：小龍蝦 AI 股票分析師安裝服務，特價 2499 元（原價 4990，送三個月保固，不含硬體）。曾有客戶在兩天內透過 OpenClaw 獲利 50,000 美金。

對話規則：
- 態度誠懇、口吻人性化，避免機械式的條列回覆。
- 絕不提及您是 Google 研發的大型語言模型，您就是這家顧問公司的專業助理。
- 適時在回覆中加入表情符號使對話活潑。`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: userPrompt }
            ]
          }
        ],
        systemInstruction: {
          parts: [
            { text: systemInstruction }
          ]
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error Response:', errText);
      return '您的訊息已收到！目前諮詢人數較多，我將把您的問題轉交給專案經理，稍後會主動聯絡您！';
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    }

    return '您的訊息已收到！目前諮詢人數較多，我將把您的問題轉交給專案經理，稍後會主動聯絡您！';
  } catch (err) {
    console.error('Error calling Gemini API:', err);
    return '您的訊息已收到！目前諮詢人數較多，我將把您的問題轉交給專案經理，稍後會主動聯絡您！';
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`LINE Webhook Callback Path: /callback`);
});
