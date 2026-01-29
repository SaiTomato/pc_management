# PC管理系统

PC管理システムのフロントエンドとバックエンドです。

## 構成

- **Frontend**: React + TypeScript + Bootstrap
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Docker)
- **Authentication**: Keycloak (Docker)

## 機能

### フロントエンド
1. ログイン画面
2. PC一覧画面（検索、ページネーション対応）
3. PC詳細画面（PC情報の登録・変更）
4. レスポンシブデザイン（PC/スマホ対応）

### バックエンド
1. RESTful API
2. PostgreSQLデータベース
3. JWT認証（Keycloak統合準備済み）

## セットアップ

### 1. 依存関係のインストール

```bash
npm run install:all
```

### 2. 環境変数の設定

#### バックエンド
`backend/.env`ファイルを作成してください：

```env
PORT=3001
DATABASE_URL=postgresql://postgres:tomato123@localhost:5433/pcmanagement
JWT_SECRET=your-secret-key-change-in-production
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=pc-management
KEYCLOAK_CLIENT_ID=pc-management-client
```

#### フロントエンド
`frontend/.env`ファイルを作成してください：

```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Dockerコンテナの起動

```bash
docker-compose up -d
```

PostgreSQLとKeycloakが起動します。

### 4. バックエンドの起動

```bash
npm run dev:backend
```

バックエンドサーバーが `http://localhost:3001` で起動します。

### 5. フロントエンドの起動

別のターミナルで：

```bash
npm run dev:frontend
```

フロントエンドが `http://localhost:3000` で起動します。

## 使用方法

### ログイン
- デモ用の認証情報：
  - ユーザー名: `admin`
  - パスワード: `admin123`

### PC管理
1. PC一覧画面でPCの一覧を確認
2. 「新規登録」ボタンでPCを追加
3. 「詳細」ボタンでPC情報を編集
4. 「削除」ボタンでPCを削除
5. 検索機能でPCを検索

## API仕様

OpenAPI仕様は`api/openapi.yaml`を参照してください。

APIエンドポイント：
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト
- `GET /api/pcs` - PC一覧取得
- `GET /api/pcs/:id` - PC詳細取得
- `POST /api/pcs` - PC登録
- `PUT /api/pcs/:id` - PC更新
- `DELETE /api/pcs/:id` - PC削除

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- Bootstrap 5
- React Router
- Axios

### バックエンド
- Node.js
- Express
- TypeScript
- PostgreSQL
- JWT認証

### インフラ
- Docker
- Docker Compose
- PostgreSQL
- Keycloak

## 開発

### バックエンド開発
```bash
cd backend
npm run dev
```

### フロントエンド開発
```bash
cd frontend
npm start
```

## 注意事項

- 現在の認証は簡易実装です。本番環境ではKeycloakと統合してください。
- データベースはDockerコンテナ起動時に自動的に初期化されます。
- Keycloakの設定は別途必要です。
