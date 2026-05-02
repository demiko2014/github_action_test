# Azure App Service Bicep

Backend API 用の Linux App Service と App Service Plan を作成します。

## 作成されるリソース

- `asp-pasori-backend-<env>`: Linux App Service Plan
- `app-pasori-backend-<env>`: Linux Web App

`<env>` は `dev` / `stg` / `prd` です。

## デプロイ例

```bash
az group create \
  --name rg-pasori-dev \
  --location japaneast

az deployment group create \
  --resource-group rg-pasori-dev \
  --template-file infra/main.bicep \
  --parameters infra/parameters/dev.bicepparam
```

dev は App Service quota を避けやすいように `japanwest` / `F1` にしています。

stg / prd は parameter ファイルを差し替えます。

```bash
az deployment group create \
  --resource-group rg-pasori-stg \
  --template-file infra/main.bicep \
  --parameters infra/parameters/stg.bicepparam
```

## GitHub Actions とのつなぎ込み

作成後、GitHub の Environment secret に以下を登録します。

- `AZURE_WEBAPP_NAME`: Bicep の `webAppName` output の値
- `AZURE_WEBAPP_PUBLISH_PROFILE`: App Service の発行プロファイル XML 全文

発行プロファイルは Azure Portal の App Service 画面、または Azure CLI で取得できます。

```bash
az webapp deployment list-publishing-profiles \
  --resource-group rg-pasori-dev \
  --name app-pasori-backend-dev \
  --xml
```
