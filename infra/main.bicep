// ==============================================
// Azure App Service 用 Bicep テンプレート
//
// このファイルは、NestJS backend API を Azure App Service に載せるための
// 最小構成を作成します。
//
// 作成するもの:
//   - Linux App Service Plan
//   - Linux Web App
//
// 環境ごとの差分は infra/parameters/*.bicepparam に分けています。
// 例:
//   dev: 開発環境
//   stg: 検証環境
//   prd: 本番環境
// ==============================================

// リソースグループ配下にリソースを作成するテンプレートです。
// そのため実行時は `az deployment group create` を使います。
targetScope = 'resourceGroup'

// Azure リソース名のベースになるアプリ名です。
// 実際のリソース名は、この値と environment を組み合わせて作ります。
// 例: appName = pasori-backend, environment = dev
//     -> app-pasori-backend-dev
@description('Azure リソース名のベースになるアプリ名です。')
@minLength(2)
@maxLength(40)
param appName string = 'pasori-backend'

// デプロイ先の環境名です。
// 誤入力で想定外の環境名を作らないよう、dev / stg / prd のみに制限しています。
@description('デプロイ先の環境名です。')
@allowed([
  'dev'
  'stg'
  'prd'
])
param environment string = 'dev'

// Azure リソースを作成するリージョンです。
// 指定しない場合は、デプロイ先リソースグループと同じリージョンになります。
@description('Azure リソースを作成するリージョンです。')
param location string = resourceGroup().location

// App Service Plan の SKU です。
// dev はコストを抑えるため F1 を使えます。
// stg/prd は本番運用を考えるなら B1 以上を想定します。
@description('Linux App Service Plan の SKU です。')
@allowed([
  'F1'
  'B1'
  'S1'
  'P0v3'
  'P1v3'
])
param skuName string = 'B1'

// App Service Plan のインスタンス数です。
// F1 はスケールアウトできないため、実質 1 のまま使います。
// B1 以上でスケールアウトしたい場合に増やします。
@description('App Service Plan のインスタンス数です。')
@minValue(1)
@maxValue(10)
param workerCount int = 1

// Web App の Node.js ランタイムです。
// backend/package.json と GitHub Actions の Node 20 に合わせています。
@description('Web App で使用する Node.js ランタイムです。')
param linuxFxVersion string = 'NODE|20-lts'

// 追加のアプリケーション設定です。
// 例: API キーや接続文字列など、環境ごとに変えたい値を渡せます。
// シークレット値を直接 Git 管理するのは避け、必要に応じて Key Vault や
// GitHub Actions secrets から設定する運用にしてください。
@description('追加のアプリケーション設定です。')
param appSettings object = {}

// Azure のリソース名は小文字に寄せておくと扱いやすいため、
// appName を小文字化してから suffix を組み立てます。
var normalizedAppName = toLower(appName)
var resourceSuffix = '${normalizedAppName}-${environment}'

// App Service に設定するアプリケーション設定です。
// appSettings で同じキーを渡した場合は、引数側の値で上書きされます。
var mergedAppSettings = union({
  // NestJS 側などで環境判定に使えるようにします。
  NODE_ENV: environment == 'prd' ? 'production' : environment

  // GitHub Actions 側でビルド済み zip をデプロイするため、
  // App Service 上では Oryx の自動ビルドを走らせません。
  SCM_DO_BUILD_DURING_DEPLOYMENT: 'false'
}, appSettings)

// Linux App Service Plan です。
// App Service Plan は Web App を動かすための実行基盤で、
// SKU やインスタンス数はここで決まります。
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: 'asp-${resourceSuffix}'
  location: location
  sku: {
    name: skuName
    capacity: workerCount
  }
  kind: 'linux'
  properties: {
    // Linux App Service Plan を作るために必須の設定です。
    reserved: true
  }
}

// backend API をホストする Linux Web App です。
// 実際のアプリケーションコードは GitHub Actions の deploy.yml から zip deploy します。
resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: 'app-${resourceSuffix}'
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      // Node.js 20 LTS の Linux ランタイムを指定します。
      linuxFxVersion: linuxFxVersion

      // backend/package.json の start script を呼び出します。
      appCommandLine: 'npm start'

      // FTP は暗号化された FTPS のみに制限します。
      ftpsState: 'FtpsOnly'

      // backend/src/main.ts で global prefix に "api" を設定しているため、
      // HealthController の /health は実際には /api/health になります。
      healthCheckPath: '/api/health'

      // object 型で受け取った app settings を、App Service の配列形式に変換します。
      appSettings: [
        for settingName in items(mergedAppSettings): {
          name: settingName.key
          value: string(settingName.value)
        }
      ]
    }
  }
}

// GitHub Actions secrets やデプロイ後確認で使いやすいよう、主要な値を出力します。
output appServicePlanName string = appServicePlan.name
output webAppName string = webApp.name
output webAppHostName string = webApp.properties.defaultHostName
output healthCheckUrl string = 'https://${webApp.properties.defaultHostName}/api/health'
