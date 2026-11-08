# YouTube 分享連結淨化

繼續使用 YouTube 原生的複製、社群分享及嵌入功能，不新增任何按鈕。

移除 si 與 feature=shared，保留開始時間、播放清單及播放選項。清理社群分享目標中經過編碼的 YouTube 連結，並移除用於產生 iframe 中 si 的分享歸因識別碼。

使用 Tampermonkey 安裝後重新整理 YouTube。舊版使用者請更新或取代原腳本，不要同時啟用兩份。

僅在列出的 YouTube 網頁本機處理。不增加網路請求、不載入外部程式碼、不儲存分享紀錄，也不讀取既有剪貼簿。移除連結參數無法關閉 YouTube 或目標網站本身的統計追蹤。

主要於桌面 Chrome 驗證；Edge 等其他瀏覽器仍需進一步測試，無法保證所有可安裝 Tampermonkey 的瀏覽器都相容。不適用於手機 YouTube App。
