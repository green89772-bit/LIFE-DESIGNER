# Life Designer | 做自己的生命設計師

這是一個基於《做自己的生命設計師》(Designing Your Life) 工具書以及修修 (Shosho) 影片分享的數位化生命設計工具。旨在幫助使用者透過科學的設計思考 (Design Thinking) 流程，一步步規劃出充滿意義且具備生產力的「快樂事業」。

## 🚀 功能特點

本應用程式數位化了生命設計的核心流程：

1. **生命指標儀錶板 (Dashboard)**：評估健康 (Health)、工作 (Work)、遊戲 (Play) 與愛 (Love) 的平衡狀態。
2. **人生羅盤 (Compass)**：對齊你的「工作觀」與「人生觀」，確保生活的一致性。
3. **好時光日誌 (Good Time Journal)**：追蹤精力與投入度，找出進入「心流」的規律。
4. **AI 心智圖發想 (Mind Mapping)**：利用 Google Gemini AI 幫助你跳脫框架，進行天馬行空的職涯聯想。
5. **奧德賽計畫 (Odyssey Plans)**：描繪三個版本的人生藍圖（現況、備案、夢想）。
6. **原型設計與團隊 (Prototyping & Team)**：提醒你透過訪談與小規模體驗來驗證想法，並組建支援小組。
7. **AI 念頭轉向器 (AI Reframer)**：自動將「失功能信念」(Dysfunctional Belief) 重擬為正向的行動指標。

## 🛠️ 技術架構

- **前端框架**: React 19 + TypeScript
- **樣式處理**: Tailwind CSS (極簡主義設計風格)
- **動畫效果**: Motion (Framer Motion)
- **數據圖表**: Recharts (雷達圖呈現生命狀態)
- **人工智慧**: Google Gemini API (用於概念重擬與心智圖發想)
- **持久化**: LocalStorage (自動儲存你的設計進度)

## 📦 如何在本地啟動

1. **複製專案**
   ```bash
   git clone <your-repo-url>
   cd life-designer
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **設定環境變數**
   在根目錄建立 `.env` 檔案，並填入你的 Gemini API Key：
   ```env
   VITE_GEMINI_API_KEY=你的金鑰
   ```

4. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

## 📖 核心理念

> 「熱情是良好生命設計帶來的結果，而不是源頭。」 — Bill Burnett & Dave Evans

這個工具並不是要給你一個標準答案，而是提供一個框架，讓你在不斷的迭代與嘗試中，設計出屬於自己的夢幻人生。

---
*Inspired by Shosho's Video: [科學地設計你的夢幻人生](https://www.youtube.com/@shosho_tw)*
