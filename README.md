# 🏦 마마트레이딩 (MAMA TRADING) 맞춤 대출 서비스 & DB 접수 시스템

> **신용 영향 없는 1분 안심 가심사 · 15분 당일 입금 맞춤 대출 랜딩플랫폼 & 데이터베이스 연동 시스템**

![Node.js](https://img.shields.io/badge/Node.js-v18.x-green?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-v5.x-black?style=flat-square&logo=express)
![EJS](https://img.shields.io/badge/EJS-View_Engine-blue?style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-GET__DBDATA-orange?style=flat-square&logo=mysql)

---

## 🌟 주요 특징 (Key Features)

1. **🎬 시네마틱 스티키 패러랙스 히어로 섹션**:
   - 스크롤과 실시간 연동되어 좌측 `SPEED LOAN`과 우측 `LOW RATE` 타이틀이 모이면서 화면이 핀 고정되는 미학적 인터랙션 연동
2. **📱 모바일 퍼펙트 반응형 디자인**:
   - 데스크톱 grid 및 모바일 슬림 2줄 콤팩트 신청 바 (`성함` / `연락처` / `동의` 1라인 + `희망금액` 한 칸 배치)
3. **💬 모바일 3.5초 Auto-Play 이용후기 슬라이더**:
   - 8가지 실감 나는 고객 후기를 모바일에서 3.5초마다 부드럽게 자동 슬라이드 (터치 시 일시 정지)
4. **🖼️ 4단계 스피드 대출 절차 커스텀 이미지 카드**:
   - `pr_1.png` ~ `pr_4.png` 고화질 브랜드 이미지 배경과 다크 오버레이를 통합한 입체적 절차 안내
5. **🗄️ MySQL `GET_DBDATA` DB 자동 접수 및 퍼스널 로그 연동**:
   - 신청 폼 제출 시 비동기(AJAX fetch)로 `loan_applications` 및 `application_logs` 테이블에 데이터 자동 저장

---

## 🛠️ 기술 스택 (Tech Stack)

* **Backend**: Node.js, Express.js
* **Frontend**: HTML5, Vanilla CSS3 (Custom CSS Variables & Flexbox/Grid), Vanilla JavaScript (ES6+), EJS View Engine
* **Database**: MySQL / MariaDB (`mysql2/promise` Connection Pool)
* **Configuration**: `dotenv` (IP: `175.125.92.74`, Database: `GET_DBDATA`, User: `dbmanager`)

---

## 📂 프로젝트 구조 (Directory Structure)

```
cashLoan/
├── config/
│   └── db.js                 # MySQL 커넥션 풀 연결 모듈
├── public/
│   ├── css/
│   │   ├── style-web.css     # 데스크톱 웹 스타일시트
│   │   └── style-mobile.css  # 모바일 반응형 전용 스타일시트
│   ├── images/               # 메인 및 pr_1~4 브랜드 이미지
│   └── js/
│       └── ui-interactions.js# 스크롤 패러랙스, 모바일 슬라이더 & AJAX 접수 JS
├── routes/
│   ├── index.js              # 메인페이지 라우트
│   ├── products.js           # 대출 상품 상세 라우트 (/products/*)
│   └── api.js                # DB 대출 접수 API 라우트 (/api/apply)
├── views/
│   ├── partials/             # 헤더, 푸터, 고정 신청바, 모달 조각 템플릿
│   ├── index.ejs             # 메인 랜딩페이지
│   ├── process.ejs           # 4단계 대출 절차 상세페이지 (/process)
│   ├── reviews.ejs           # 고객 생생 이용후기 상세페이지 (/reviews)
│   └── product-detail.ejs    # 5대 대출 상품 개별 상세페이지
├── .env                      # DB 접속 환경 변수 (Git 배제)
├── .gitignore
├── package.json
├── server.js                 # Express 웹 서버 메인 엔트리 포인트
└── README.md
```

---

## 🗄️ 데이터베이스 DDL 스키마 (`GET_DBDATA`)

```sql
CREATE DATABASE IF NOT EXISTS `GET_DBDATA` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `GET_DBDATA`;

-- 1. 대출 신청 접수 테이블
CREATE TABLE IF NOT EXISTS `loan_applications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `applicant_name` VARCHAR(50) NOT NULL,
    `applicant_phone` VARCHAR(20) NOT NULL,
    `desired_amount` VARCHAR(50) NOT NULL,
    `loan_type` VARCHAR(50) DEFAULT '일반대출',
    `loan_period_months` INT DEFAULT 12,
    `agreed_privacy` TINYINT(1) NOT NULL DEFAULT 1,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `admin_memo` TEXT DEFAULT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `user_agent` VARCHAR(255) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 퍼스널 및 알림 로그 테이블
CREATE TABLE IF NOT EXISTS `application_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `application_id` BIGINT NOT NULL,
    `log_type` VARCHAR(30) NOT NULL,
    `action_user` VARCHAR(50) DEFAULT 'SYSTEM',
    `message` TEXT NOT NULL,
    `result_status` VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    `error_detail` TEXT DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`application_id`) REFERENCES `loan_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 사용자/관리자 계정 테이블
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `user_name` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 🚀 실행 방법 (Getting Started)

1. **의존성 모듈 설치**:
   ```bash
   npm install
   ```

2. **환경변수 설정 (`.env`)**:
   ```env
   DB_HOST=175.125.92.74
   DB_PORT=3306
   DB_USER=dbmanager
   DB_PASSWORD=your_password
   DB_NAME=GET_DBDATA
   PORT=3000
   ```

3. **로컬 서버 가동**:
   ```bash
   node server.js
   ```

4. **웹 브라우저 접속**:
   - `http://localhost:3000`
