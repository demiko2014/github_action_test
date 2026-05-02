// ==============================================
// stg 環境用パラメータ
//
// staging は本番前検証用の環境です。
// dev より本番に近い構成にするため、既定では B1 を指定しています。
// 利用するサブスクリプション/リージョンの quota によっては、
// location や skuName の調整が必要です。
// ==============================================

using '../main.bicep'

// リソース名のベースです。
// 実際の Web App 名は app-pasori-backend-stg になります。
param appName = 'pasori-backend'

// GitHub Actions の deploy.yml で選ぶ environment 名と合わせます。
param environment = 'stg'

// B1 は専用 compute の最小クラスです。
// quota が足りない場合は、Azure Portal で Basic VMs quota を申請してください。
param skuName = 'B1'
