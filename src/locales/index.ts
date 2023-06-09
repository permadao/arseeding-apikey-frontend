import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      en: {
        translation: {
          "Top up": "Top up",
          "CONNECT WALLET": "CONNECT WALLET",
          "Wallet Connected": "Wallet Connected",
          "View Apikey": "View Apikey",
          "Estimate cap:": "Estimate cap:",
          "Token balances in this apikey": "Token balances in this apikey",
          "Storage cost estimator": "Storage cost estimator",
          Max: "Max",
          Clear: "Clear",
          "Invalid Topup Amount": "Invalid Topup Amount",
          "Insufficinent balance": "Insufficinent balance",
          TOPUP: "TOPUP",
          "Invalid Topup Token": "Invalid Topup Token",
          "Apikey Status": "Apikey Status",
          "Topup to register current address a apikey.":
            "Topup to register current address a apikey.",
          Per: "Per",
          "pending transaction": "pending transaction",
          "transaction has been minted": "transaction has been minted",
          English: "English",
          简体中文: "简体中文",
          copied: "copied",
          "Transaction histories": "Topup histories",
          "Connect Wallet to Adopt Arseeding Apikey":
            "Connect Wallet to Adopt Arseeding Apikey",
          rawId: "rawId",
          token: "token",
          amount: "amount",
          everHash: "everHash",
          timestamp: "timestamp",
          "No more history item.": "No more history item.",
          "Log out": "Disconnect",
        },
      },
      zh: {
        translation: {
          "Top up": "充值",
          "CONNECT WALLET": "连接钱包",
          "Wallet Connected": "钱包已连接",
          "View Apikey": "查看 Apikey",
          "Estimate cap:": "预估可用容量：",
          "Token balances in this apikey": "当前 apikey 中的代币余额",
          "Storage cost estimator": "费用计算器",
          Max: "最大",
          Clear: "清除",
          "Invalid Topup Amount": "无效的充值金额",
          "Insufficinent balance": "余额不足",
          TOPUP: "充值",
          "Invalid Topup Token": "无效的代币",
          "Apikey Status": "Apikey 状态",
          "Topup to register current address a apikey.":
            "充值来为当前地址注册一个 apikey.",
          Per: "每",
          "pending transaction": "交易提交中",
          English: "English",
          简体中文: "简体中文",
          copied: "已复制",
          "Transaction histories": "充值记录",
          "Connect Wallet to Adopt Arseeding Apikey":
            "连接钱包以启用 Arseeding Apikey 服务",
          rawId: "rawId",
          token: "代币",
          amount: "数量",
          everHash: "everHash",
          timestamp: "时间",
          "No more history item.": "没有记录",
          "Log out": "断开链接",
        },
      },
    },
    // if you're using a language detector, do not define the lng option
    lng: "zh",
    fallbackLng: "zh",
    interpolation: {
      // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
      escapeValue: false,
    },
  });

export default i18n;
