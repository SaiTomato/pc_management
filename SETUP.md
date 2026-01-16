# セットアップガイド

## 初回セットアップ手順

### 1. 前提条件
- Node.js (v18以上)
- npm または yarn
- Docker と Docker Compose

### 2. プロジェクトのクローン/ダウンロード後

```bash
# 依存関係のインストール
npm run install:all
```

### 3. 環境変数の設定

#### バックエンド
`backend`ディレクトリに`.env`ファイルを作成：

```env
PORT=3001
DATABASE_URL=postgresql://pcuser:pcpass@localhost:5432/pcmanagement
JWT_SECRET=your-secret-key-change-in-production-please-use-strong-secret
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=pc-management
KEYCLOAK_CLIENT_ID=pc-management-client
```

#### フロントエンド
`frontend`ディレクトリに`.env`ファイルを作成：

```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 4. Dockerコンテナの起動

```bash
docker-compose up -d
```

これにより以下が起動します：
- PostgreSQL (ポート 5432)
- Keycloak (ポート 8080)

### 5. バックエンドの起動

```bash
npm run dev:backend
```

または

```bash
cd backend
npm run dev
```

### 6. フロントエンドの起動（別ターミナル）

```bash
npm run dev:frontend
```

または

```bash
cd frontend
npm start
```

### 7. ブラウザでアクセス

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001
- Keycloak: http://localhost:8080

## Keycloak設定（オプション）

現在は簡易認証を使用していますが、Keycloakを統合する場合：

1. Keycloak管理コンソールにアクセス: http://localhost:8080
2. ユーザー名: `admin`, パスワード: `admin` でログイン
3. Realm `pc-management` を作成
4. Client `pc-management-client` を作成
5. バックエンドコードを更新してKeycloakと統合

## トラブルシューティング

### データベース接続エラー
- Dockerコンテナが起動しているか確認: `docker ps`
- PostgreSQLが正常に起動しているか確認: `docker logs pc-management-postgres`

### ポートが既に使用されている
- ポート3000, 3001, 5432, 8080が使用されていないか確認
- 必要に応じて`.env`ファイルでポートを変更

### 依存関係のインストールエラー
- Node.jsのバージョンを確認: `node --version`
- `node_modules`を削除して再インストール:
  ```bash
  rm -rf node_modules backend/node_modules frontend/node_modules
  npm run install:all
  ```
