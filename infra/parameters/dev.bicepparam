// ==============================================
// dev 環境用パラメータ
//
// 開発環境は当初 F1 を使っていましたが、無料枠の CPU quota に到達すると
// App Service が QuotaExceeded になりデプロイできなくなるため、B1 にしています。
// Japan East は作成時点で App Service quota が 0 だったため、
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

// B1 は有料です。App Service Plan が存在する間は課金されます。
param skuName = 'B1'
