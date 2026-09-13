# DbD Board Game Automa Helper

A static web helper for solo play of **Dead by Daylight: The Board Game** (Automa Killer / Automa Survivors).
It rolls the dice, draws the movement cards and keeps the easy-to-forget rules on screen.

- App: https://bluekms.github.io/dbd-boardgame-automa-helper/
- Default language is English. Tap the language button (top right) to switch to Korean.

데드 바이 데이라이트 보드게임의 1인 플레이(오토마 살인마 / 오토마 생존자)를 돕는 정적 웹앱입니다.
주사위 굴리기와 카드 뽑기를 대신 해 주고, 잊기 쉬운 규칙을 상기시킵니다.

## 기능

**오토마 살인마** (트래퍼 · 너스 · 헌트리스 · 힐빌리)
- 중앙을 터치하면 이동 주사위(0~5)를 굴려 이동 카드 / 대기 / 고유 능력을 표시
- 타일 공개 우선순위, 상호작용 우선순위, 둘러업기 절차, 재굴림 조건
- 블러드 포인트 · 희생 진척 수동 카운터, 스킬 체크 주사위(1~4개)

**오토마 생존자** (드와이트 · 메그 · 제이크 · 클로뎃)
- 16장 공용 이동 카드 더미 시뮬레이션(버린 더미 자동 재섞기, 경로 없음 → 1장 더)
- 강제 이동 조건, 타일 공개 우선순위, 상호작용 우선순위, 고유 능력, 수정된 아이템 효과
- 생존자별 블러드 포인트 카운터, 스킬 체크 주사위

## 구성

프레임워크와 빌드 단계 없이 다음 파일만으로 동작하며 GitHub Pages 로 배포합니다.

```
index.html      화면 구조
style.css       스타일
app.js          동작 (주사위·더미·카운터·화면 전환)
locales/*.js    언어별 문자열
resource/*.png  이미지
```

로컬에서 확인하려면 저장소 루트에서 정적 서버를 하나 띄우면 됩니다. 예: `python -m http.server 8000`

## 언어 추가하기 (Adding a language)

1. `locales/en.js` 를 복사해 `locales/<언어코드>.js` 로 만듭니다 (예: `locales/ja.js`).
2. 파일 안의 `window.DBD_LOCALES.en` 을 `window.DBD_LOCALES.<언어코드>` 로, `name` 을 그 언어의 자기 이름(예: `'日本語'`)으로 바꾸고 `strings` 를 번역합니다.
   - 키는 `en.js` 가 기준입니다. 번역하지 않은 키는 영어로 표시되므로 부분 번역도 동작합니다.
   - `{n}` 같은 중괄호 자리표시자와 HTML 태그(`<b>`, `<li>` 등)는 그대로 둡니다.
3. `index.html` 의 `<script src="locales/...">` 목록에 새 파일을 한 줄 추가합니다.

언어 버튼 메뉴는 등록된 로케일을 자동으로 나열하므로 다른 코드 수정은 필요 없습니다.

## 출처

- Dead by Daylight™: The Board Game — Level 99 Games / Behaviour Interactive
- 한국어판 룰북 — 데블다이스 게임즈. 초상화·카드·타일 이미지는 룰북 PDF 에서 추출했습니다.
- 헌트리스 초상화는 룰북에 없어 [Dead by Daylight Wiki](https://deadbydaylight.wiki.gg/wiki/Huntress) 의 게임 이미지를 사용했습니다.
