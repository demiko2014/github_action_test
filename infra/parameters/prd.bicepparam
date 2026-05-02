// ==============================================
// prd 環境用パラメータ
//
// production は本番環境です。
// GitHub Environments 側で Required reviewers を設定し、
// 手動承認後にデプロイする運用を想定しています。
// ==============================================

using '../main.bicep'

// リソース名のベースです。
// 実際の Web App 名は app-pasori-backend-prd になります。
param appName = 'pasori-backend'

// GitHub Actions の deploy.yml で選ぶ environment 名と合わせます。
param environment = 'prd'

// 本番の最小構成として B1 を指定しています。
// 実運用で負荷が増える場合は S1/P1v3 などへの変更を検討します。
param skuName = 'B1'
