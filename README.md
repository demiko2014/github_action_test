# PaSoRi FeliCa Reader

[![Frontend CI](https://github.com/demiko2014/github_action_test/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/demiko2014/github_action_test/actions/workflows/ci-frontend.yml)
[![Backend CI](https://github.com/demiko2014/github_action_test/actions/workflows/ci-backend.yml/badge.svg)](https://github.com/demiko2014/github_action_test/actions/workflows/ci-backend.yml)

PaSoRi (RC-S380 など) を使って **FeliCa カード** を読み取る NestJS Commander CLI アプリです。  
GitHub Actions の学習用サンプルとしても活用できます。

---

## 動作要件

| 必須        | バージョン                                  |
| ----------- | ------------------------------------------- |
| Node.js     | v20 以上                                    |
| PaSoRi      | RC-S380 / RC-S300 等                        |
| OS ドライバ | Windows: WinSCard (標準搭載) / Linux: pcscd |
| Python      | 3.x (nfc-pcsc のネイティブビルド用)         |

---

## セットアップ

```bash
# クローン
git clone https://github.com/demiko2014/github_action_test.git
cd github_action_test

# 依存関係インストール（ネイティブビルドが走ります）
npm install

# TypeScript コンパイル
npm run build
```

### Linux (Ubuntu) の追加手順

```bash
sudo apt-get install -y pcscd libpcsclite-dev
sudo systemctl start pcscd
```

---

## 使い方

```bash
# カード情報表示（IDm / PMm / カード種類）
npm start
# または
node dist/main.js read

# 残高読み取りモード（交通系 IC）
npm run start:balance
# または
node dist/main.js read --mode balance

# タイムアウトを 60 秒に設定
node dist/main.js read --timeout 60000

# ヘルプ
node dist/main.js read --help
```

### 実行例

```
 PaSoRi FeliCa リーダー
========================================
  モード   : カード情報
  タイムアウト: 30000ms
========================================
  カードをリーダーにタッチしてください...

リーダー検出: Sony SONY RC-S380/P Contactless Card Reader

========================================
  FeliCa カード読み取り結果
========================================
  IDm         : 0311AABB CCDDEEFF
  PMm         : 0F0D000D 1388004B
  カード種類   : 交通系 IC (Suica/PASMO 等)
========================================
```

---

## テスト

```bash
# ユニットテスト
npm test

# カバレッジ付き
npm run test:cov
```

---

## GitHub Actions 解説

| ファイル                        | 説明                                          |
| ------------------------------- | --------------------------------------------- |
| `.github/workflows/ci.yml`      | push / PR 時にテスト & ビルドを実行           |
| `.github/workflows/release.yml` | `v*.*.*` タグ push 時に GitHub Release を作成 |

### CI ワークフローの主なポイント

```
push/PR
  └─ test (Node 20 + 22 のマトリックス)
       ├─ npm ci --ignore-scripts  ← ネイティブビルドをスキップ
       ├─ tsc --noEmit             ← 型チェック
       └─ jest --ci                ← ユニットテスト + カバレッジ
  └─ build (test 成功後)
       ├─ tsc                      ← コンパイル
       └─ upload-artifact          ← dist/ を保存
```

### リリース手順

```bash
git tag v1.0.0
git push --tags
# → release.yml が自動実行 → GitHub Release が作成される
```

---

## プロジェクト構成

```
.
├── src/
│   ├── main.ts                  # エントリーポイント
│   ├── app.module.ts            # ルートモジュール
│   └── felica/
│       ├── felica.module.ts     # FeliCa モジュール
│       ├── felica.service.ts    # カード解析ロジック
│       ├── nfc-reader.service.ts # PaSoRi 読み取りサービス
│       └── read.command.ts      # CLI コマンド定義
├── test/
│   └── felica.service.spec.ts   # ユニットテスト
├── .github/
│   └── workflows/
│       ├── ci.yml               # CI ワークフロー
│       └── release.yml          # リリースワークフロー
├── jest.config.ts
└── tsconfig.json
```
