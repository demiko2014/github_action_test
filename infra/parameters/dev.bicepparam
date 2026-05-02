// ==============================================
// dev 環境用パラメータ
//
// 開発環境はコストを抑えるため、無料 SKU の F1 を使います。
// Japan East は App Service quota が 0 で作成できなかったため、
// 作成検証が通った Japan West を指定しています。
// ==============================================

using '../main.bicep'

// リソース名のベースです。
// 実際の Web App 名は app-pasori-backend-dev になります。
param appName = 'pasori-backend'

// GitHub Actions の deploy.yml で選ぶ environment 名と合わせます。
param environment = 'dev'

// dev は Japan West に作成します。
param location = 'japanwest'

// F1 は無料枠です。検証用途向けで、スケールアウトや本番運用には向きません。
param skuName = 'F1'
