# EZCON 午餐訂購系統後端

午餐訂購系統的後端服務，基於 Feathers Framework 構建。

## 功能

- 午餐訂購管理 API
- 即時通知（LINE Bot 整合）
- 使用者認證
- MongoDB 資料庫

## 環境變數

複製 `.env.example` 為 `.env` 並填入以下內容：

| 變數 | 說明 |
|------|------|
| `MONGODB_CONNECTION_STRING` | MongoDB 連線字串，格式：`mongodb://...` 或 `mongodb+srv://...` |
| `channelAccessToken` | LINE Channel Access Token |
| `channelSecret` | LINE Channel Secret |
| `PORT` | 伺服器端口（預設 3030） |
| `domain` | 部署網域，例如 `https://your-app.onrender.com` |

## 開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 執行測試
npm test

# 啟動生產環境
npm start
```

## 架構

```
src/
  app.js          — Feathers Express 應用程式
  index.js        — 伺服器入口
  logger.js       — Winston 日誌設定
config/
  default.json    — 預設設定
  production.json — 生產環境設定
  test.json       — 測試環境設定
```

## 部署

已設定 GitHub Actions 自動部署，合并到 master 分支後自動觸發。

## 授權

ISC
