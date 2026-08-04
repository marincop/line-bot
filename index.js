require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');

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

// Webhook callback endpoint
app.post('/callback', line.middleware(config), (req, res) => {
  // Extract external host (e.g. serveo URL)
  const host = `${req.protocol}://${req.get('host')}`;
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
          type: 'text',
          text: '📩【專人諮詢專區】\n\n已通知專案負責人！為了能更高效處理您的問題，請在下方訊息框直接留下：\n\n1. 您的姓名 / 公司名稱：\n2. 方便聯絡的電話：\n3. 簡述您的需求（例如：想做採買系統、需要 OpenClaw 部署等）：\n\n專案負責人將會儘速回覆您，感謝您的耐心等待！'
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

  // 預設回覆
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [
      {
        type: 'text',
        text: `收到您的訊息: "${userMessage}"\n\n💡 請直接點擊底部的圖文選單按鈕，或輸入「AI」、「系統」、「POS」或「預約諮詢」來取得更多資訊！`
      }
    ]
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`LINE Webhook Callback Path: /callback`);
});
