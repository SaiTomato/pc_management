# プロジェクト構造

```
pc_management/
├── api/
│   └── openapi.yaml          # OpenAPI仕様書
├── backend/                  # バックエンド
│   ├── src/
│   │   ├── db.ts            # データベース接続と初期化
│   │   ├── index.ts         # エントリーポイント
│   │   ├── middleware/
│   │   │   └── auth.ts      # 認証ミドルウェア
│   │   └── routes/
│   │       ├── auth.ts      # 認証ルート
│   │       └── pcs.ts       # PC管理ルート
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # フロントエンド
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── PrivateRoute.tsx  # 認証保護ルート
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx   # 認証コンテキスト
│   │   ├── pages/
│   │   │   ├── Login.tsx         # ログイン画面
│   │   │   ├── Login.css
│   │   │   ├── PCList.tsx        # PC一覧画面
│   │   │   ├── PCList.css
│   │   │   ├── PCDetail.tsx      # PC詳細画面
│   │   │   └── PCDetail.css
│   │   ├── services/
│   │   │   ├── authService.ts    # 認証APIサービス
│   │   │   └── pcService.ts      # PC管理APIサービス
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.tsx
│   │   └── react-app-env.d.ts
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml        # Docker Compose設定
├── init-db.sql              # データベース初期化SQL
├── package.json             # ルートpackage.json
├── README.md                # プロジェクト説明
├── SETUP.md                 # セットアップガイド
├── start.sh                 # Linux/Mac起動スクリプト
└── start.bat                # Windows起動スクリプト
```

## 主要ファイルの説明

### バックエンド

- `backend/src/index.ts`: Expressサーバーのエントリーポイント
- `backend/src/db.ts`: PostgreSQL接続とテーブル初期化
- `backend/src/routes/auth.ts`: 認証API（ログイン/ログアウト）
- `backend/src/routes/pcs.ts`: PC管理API（CRUD操作）
- `backend/src/middleware/auth.ts`: JWT認証ミドルウェア

### フロントエンド

- `frontend/src/App.tsx`: メインアプリケーションコンポーネント（ルーティング）
- `frontend/src/pages/Login.tsx`: ログイン画面
- `frontend/src/pages/PCList.tsx`: PC一覧画面（検索、ページネーション）
- `frontend/src/pages/PCDetail.tsx`: PC詳細・編集画面
- `frontend/src/contexts/AuthContext.tsx`: 認証状態管理
- `frontend/src/services/authService.ts`: 認証API呼び出し
- `frontend/src/services/pcService.ts`: PC管理API呼び出し

### 設定ファイル

- `api/openapi.yaml`: OpenAPI 3.0仕様書
- `docker-compose.yml`: PostgreSQLとKeycloakのDocker設定
- `init-db.sql`: Keycloak用データベース初期化
