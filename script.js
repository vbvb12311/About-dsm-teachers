/**
 * =========================================================================
 * [글로벌 데이터 세팅 및 초기 상태 관리]
 * 로컬 스토리지가 비어있을 경우 브라우저 렌더링 에러를 방지하기 위한 더미 후기 팩 정의
 * =========================================================================
 */
const defaultReviews = [
  {
    id: 1,
    text: "설명이 자세하고 수업이 재미있어요.",
    likes: 0,
    createdAt: Date.now() - 1000 * 60 * 60, // 현재 시간 기준 1시간 전 타임스탬프 생성
  },
];

// 로컬 스토리지에 기장된 'reviews' 데이터가 있다면 파싱하고, 없으면 기본 배열로 상태 초기화
let reviews =
  JSON.parse(localStorage.getItem("reviews") || "null") || defaultReviews;
let currentSort = "latest"; // 초기 타임라인 정렬 플래그 (최신순)

/**
 * [공통 유틸리티 기능] 후기 배열 데이터를 브라우저 영구 저장소에 직렬화하여 기장함
 */
function saveReviews() {
  localStorage.setItem("reviews", JSON.stringify(reviews));
}

/**
 * [인증 상태 검사 기능] 세션 스토리지 역할을 하는 로컬 스토리지 키의 존재 여부 반환
 */
function isLoggedIn() {
  return localStorage.getItem("loginUser") !== null;
}

/**
 * [세션 유저 확인 기능] 현재 시스템을 이용 중인 로그인 계정 ID 문자열 반환
 */
function getLoginUser() {
  return localStorage.getItem("loginUser") || "";
}

/**
 * =========================================================================
 * [핵심 SPA 네비게이션 제어 코드]
 * 브라우저 리로드 없이 싱글 페이지 내에서 탭 가시성 클래스를 제어하는 웹 스위칭 엔진
 * =========================================================================
 */
function showPage(pageId) {
  // 1단계: 화면에 존재하는 모든 가상 페이지 엘리먼트(.page) 집합 추출
  const pages = document.querySelectorAll(".page");

  // 2단계: 기존에 활성화되어 있던 모든 화면에서 'active' 가시성 클래스를 소거
  pages.forEach((page) => {
    page.classList.remove("active");
  });

  // 3단계: 사용자가 요청한 타겟 ID 화면 노드에 'active' 클래스를 바인딩하여 뷰포트 노출
  document.getElementById(pageId).classList.add("active");

  // 4단계: 화면 전환 즉시 사용자의 시선을 페이지 최상단으로 스무스하게 스크롤 이동
  window.scrollTo({ top: 0, behavior: "smooth" });

  // 5단계: 만약 전환된 페이지가 커뮤니티 후기란일 경우, 실시간 피드 목록을 갱신 렌더링
  if (pageId === "reviews") {
    renderReviews();
  }

  // 6단계: 동적 마크업 생성 및 태그 주입에 따른 외부 오픈소스 SVG 아이콘 렌더러 리빌드
  refreshIcons();
}

/**
 * [아이콘 리프레시 유틸] DOM 변경 후 Lucide 그래픽 벡터 아이콘을 화면에 재매핑함
 */
function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * =========================================================================
 * [실시간 통합 검색 및 과목 분류 분류 알고리즘 매커니즘]
 * 홈 배너 인풋 연동 처리 및 선생님 목록 키업 입력 이벤트를 처리하는 탐색 엔진 구역
 * =========================================================================
 */

/**
 * [홈 배너 전용 브릿지 검색 기능]
 * 메인 대시보드 인풋 값을 취득한 뒤 목록 탭으로 화면을 넘겨주며 목록 내 서치 엔진을 트리거함
 */
function homeSearch() {
  // 공백이 포함된 오입력 버그 방지를 위해 trim() 처리를 적용하여 검색 문자열 추출
  const searchText = document.getElementById("homeSearch").value.trim();

  // 탭 라우팅 엔진을 실행하여 선생님 목록 화면을 노출시킴
  showPage("teachers");

  // 선생님 목록 뷰 내부의 검색창 엘리먼트에 취득한 텍스트를 인젝션
  document.getElementById("teacherSearch").value = searchText;

  // 목록 내부 실시간 스캐닝 함수를 연쇄 호출하여 즉각 매칭 필터링 실행
  searchTeacher();
}

/**
 * [목록 내부 실시간 문자열 매칭 검색 엔진]
 * 사용자가 한 글자씩 입력할 때마다 대소문자를 무시하고 카드 내부 텍스트포함을 스캐닝함
 */
function searchTeacher() {
  // 검색 데이터의 대소문자 편차를 무력화하기 위해 영어 기준 전부 소문자(toLowerCase) 규격화
  const input = document.getElementById("teacherSearch").value.toLowerCase();

  // 목록 페이지에 등록되어 있는 모든 개별 선생님 항목 카드(.teacher-item) 로드
  const cards = document.querySelectorAll(".teacher-item");

  cards.forEach((card) => {
    // 카드 엘리먼트 내부에 기재된 모든 텍스트 문자열 추출 및 소문자 정합성 규격화
    const text = card.innerText.toLowerCase();

    // 조건문 분기 연산: 입력 문자열이 타겟 카드 내부 단어 풀에 포함되어 있으면 보이고, 없으면 숨김(none)
    card.style.display = text.includes(input) ? "block" : "none";
  });
}

/**
 * [카테고리 HTML5 data-* 태그 추적 정밀 매칭 필터 시스템]
 * 과목 단추 클릭 시 기존 검색창을 초기화하고 매핑된 데이터 속성을 타겟팅 분색함
 */
function filterTeacher(subject) {
  // 새로운 카테고리를 눌렀으므로 기존에 검색창에 타이핑되어 있던 텍스트 구문을 빈 값으로 초기화
  document.getElementById("teacherSearch").value = "";

  // 시스템 전체 선생님 정보 카드 풀(.teacher-item) 로드
  const cards = document.querySelectorAll(".teacher-item");

  cards.forEach((card) => {
    // HTML 마크업 시점에 부여했던 사용자 정의 속성인 'data-subject' 카테고리 태그 값 획득
    const teacherSubject = card.dataset.subject;

    // 이항 대수 조건 처리: 누른 단추가 '전체'이거나, 카드의 과목 메타데이터가 선택한 과목명과 일치하면 노출
    card.style.display =
      subject === "전체" || teacherSubject === subject ? "block" : "none";
  });
}

/**
 * =========================================================================
 * [상세 프로필 동적 데이터 인젝션 및 로컬 저장소 세션 연동]
 * 인자 값을 통한 정보 매핑 핸들러 및 인증 분기 스킨 인터랙션 처리 구역
 * =========================================================================
 */

/**
 * [선생님 상세 페이지 동적 카드 매퍼 함수]
 * 목록이나 홈에서 선택한 선생님의 식별 인자를 전달받아 상세 뷰의 텍스트와 이니셜 아바타를 실시간 가공함
 */
function openTeacher(name, subject) {
  // 1단계: 마스터 보드 타이틀 영역에 선택 타겟 선생님 성명 문자열 바인딩
  document.getElementById("teacherName").innerText = name;

  // 2단계: 담당 과목 데이터 가공 후 서브 텍스트 가이드 창에 바인딩
  document.getElementById("teacherSubject").innerText = subject + " 담당";

  // 3단계: 아바타 아이콘 내부 문자열을 선생님 성명의 첫 한 글자(slice)만 추출하여 이니셜 뱃지로 주입
  document.querySelector(".profile-image").innerText = name.slice(0, 1);

  // 4단계: 하단에 위치한 최신 한 줄 후기 컴포넌트 데이터 추출 연산 호출
  renderRecentReviews();

  // 5단계: 모든 정보 세팅이 종료되면 상세 페이지 화면 뷰(.page) 활성화
  showPage("detail");
}

/**
 * [사용자 보안 인증 및 트랜잭션 로그인 기능]
 * 공백 누락 검출 예외 처리와 로컬 저장소 키 등록을 통한 세션 구동 및 피드백 처리
 */
function login() {
  const id = document.getElementById("loginId").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const message = document.getElementById("loginMessage");

  // 예외 가드 구문: 아이디 또는 비밀번호 입력창이 공백 상태인 채 동작 시 중단 피드백 출력
  if (!id || !password) {
    message.innerText = "아이디와 비밀번호를 모두 입력해주세요.";
    return;
  }

  // 브라우저 로컬 저장소 공간에 사용자의 ID를 보관함으로써 영구 세션 생성
  localStorage.setItem("loginUser", id);

  // 시스템 작동 성공 알림 표시 및 UI 연동 갱신 함수 실행
  message.innerText = id + "님, 로그인되었습니다.";
  updateLoginUi();

  // 메인 화면으로 자동 리다이렉션 탭 이동 처리
  showPage("home");
}

/**
 * [세션 오프 로그아웃 기능] 기장된 키셋을 말소하고 UI 레이아웃을 초기 비인증 모드로 동기화
 */
function logout() {
  // 로컬 스토리지 데이터베이스에서 사용자의 계정 로그인 식별 세션 키 완전 삭제
  localStorage.removeItem("loginUser");

  // 인증 여부에 따른 전체 컴포넌트 스킨 상태 초기화
  updateLoginUi();
  alert("로그아웃되었습니다.");
  showPage("home");
}

/**
 * [글로벌 UI 세션 연동 상태 동기화 모듈]
 * 헤더 로그인 단추, 마이페이지 계정 상태 창, 후기 제약 가이드라인 문구를 일체형으로 실시간 변경
 */
function updateLoginUi() {
  const loginStatus = document.getElementById("loginStatus");
  const accountInfo = document.getElementById("accountInfo");
  const reviewGuide = document.getElementById("reviewGuide");

  // 분기 처리 연산: 로그인 상태 유무 조건 검사 함수 통과 시
  if (isLoggedIn()) {
    // 상단 헤더: 로그인 글자를 유저 이름 뱃지 아이콘 형태로 교체 적용
    loginStatus.innerHTML = `<i data-lucide="user-check"></i>${getLoginUser()}님`;
    // 설정창: 현재 접근 중인 계정 권한 문자열 명시
    accountInfo.innerText = getLoginUser() + " 학생 계정";
    // 후기창: 작성 제한 잠금 장치를 해제하는 해지 안내 가이드 표출
    reviewGuide.innerText = "로그인 상태입니다. 후기를 작성할 수 있습니다.";
  } else {
    // 비로그인 아웃 상태일 경우 초기 공용 가이드 컴포넌트 텍스트들로 일괄 백업 변경
    loginStatus.innerHTML = `<i data-lucide="log-in"></i>로그인`;
    accountInfo.innerText = "로그인하지 않음";
    reviewGuide.innerText = "로그인한 사용자만 후기를 작성할 수 있습니다.";
  }

  // 동적 마크업 교체 처리에 따라 새롭게 삽입된 헤더 내 아이콘 태그 재구동
  refreshIcons();
}

/**
 * =========================================================================
 * [학생 커뮤니티 데이터 CRUD 파이프라인 및 다크모드 코어 인터체인지 인터페이스]
 * 정렬 연산, 유저 권한 제약 분기, XSS 보안 필터 및 브라우저 온로드 스토리지 기장 지휘 통제 구역
 * =========================================================================
 */

/**
 * [학생 후기 신규 기장 등록 트랜잭션 함수]
 * 비인증 가드 검사, 입력 필드 공백 검사, 타임스탬프 고유 ID 생성을 포함한 스토리지 push 처리
 */
function addReview() {
  if (!isLoggedIn()) {
    alert("로그인 후 후기를 작성할 수 있습니다.");
    showPage("login");
    return;
  }

  const textarea = document.getElementById("reviewInput");
  const text = textarea.value.trim();

  if (text === "") {
    alert("후기를 입력해주세요.");
    return;
  }

  // 전역 상태 관리 객체 풀에 유니크 고유 식별키(Date.now)를 포함한 리뷰 레코드 객체 주입
  reviews.push({
    id: Date.now(),
    text: text,
    likes: 0,
    createdAt: Date.now(),
    writer: getLoginUser(),
  });

  saveReviews();
  textarea.value = "";

  // 리스트 컴포넌트 동시 갱신 렌더링 호출
  renderReviews();
  renderRecentReviews();
  alert("후기가 등록되었습니다.");
}

/**
 * [메인 커뮤니티 후기 목록 갱신 고기능 렌더러 알고리즘]
 * 원본 배열 훼손 방지를 위한 전개 연산자([...]) 복사 및 최신순/추천순 스위칭 정렬 연산 적용
 */
function renderReviews() {
  const reviewList = document.getElementById("reviewList");

  const sortedReviews = [...reviews].sort((a, b) => {
    if (currentSort === "likes") {
      return b.likes - a.likes; // 추천 수 기준 내림차순 정렬 알고리즘
    }
    return b.createdAt - a.createdAt; // 고유 타임스탬프 시각 정합 내림차순 정렬 (최신순)
  });

  // 정렬이 완료된 데이터 세트를 map 반복문으로 순회하며 동적 카드 컴포넌트 HTML 구조물로 바인딩 전환
  // 보안 필수 처리: 사용자가 등록한 텍스트 구문은 반드시 악성 태그 주입을 막는 escapeHtml 유틸 필터를 경유함
  reviewList.innerHTML = sortedReviews
    .map(
      (review) => `
        <div class="review-card">
          <p>${escapeHtml(review.text)}</p>
          <button onclick="likeReview(${review.id})">
            <i data-lucide="thumbs-up"></i>
            좋아요 <span>${review.likes}</span>
          </button>
          <button onclick="reportReview(${review.id})">
            <i data-lucide="flag"></i>
            신고
          </button>
        </div>
      `,
    )
    .join("");

  refreshIcons(); // 카드가 새로 생성될 때마다 카드 내부의 Lucide 아이콘 그래픽 구동
}

/**
 * [상세 뷰 서브 컴포넌트 전용 최신 리뷰 2건 슬라이싱 렌더러]
 */
function renderRecentReviews() {
  const recentReviews = document.getElementById("recentReviews");
  if (!recentReviews) return;

  const latest = [...reviews]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 2);
  recentReviews.innerHTML = latest
    .map((review) => `<p>${escapeHtml(review.text)}</p>`)
    .join("");
}

/**
 * [정렬 플래그 스위칭 스케줄러] 상단 단추에 지정된 매개변수 값으로 기준 변경 후 리렌더링
 */
function sortReviews(type) {
  currentSort = type;
  renderReviews();
}

/**
 * [후기 추천 누적 증감 카운터 함수] 일치하는 ID 개체의 데이터 스택 카운트 단조 증가 처리
 */
function likeReview(reviewId) {
  reviews = reviews.map((review) =>
    review.id === reviewId ? { ...review, likes: review.likes + 1 } : review,
  );
  saveReviews();
  renderReviews();
}

/**
 * [리뷰 악성 신고 데이터 누적 저장 모듈]
 */
function reportReview(reviewId) {
  const reports = JSON.parse(localStorage.getItem("reports") || "[]");
  reports.push({ type: "review", reviewId: reviewId, createdAt: Date.now() });
  localStorage.setItem("reports", JSON.stringify(reports));
  alert("신고가 접수되었습니다.");
}

/**
 * [선생님 부적절 행위 신고 데이터 누적 저장 모듈]
 */
function reportTeacher() {
  const reports = JSON.parse(localStorage.getItem("reports") || "[]");
  reports.push({
    type: "teacher",
    teacher: document.getElementById("teacherName").innerText,
    createdAt: Date.now(),
  });
  localStorage.setItem("reports", JSON.stringify(reports));
  alert("선생님 신고가 접수되었습니다.");
}

/**
 * [포커싱 무빙 유틸 기능] 후기 입력 탭으로 강제 이동 처리 후 작성 에어리어창에 오토 포커스 하이라이트
 */
function goReviewWrite() {
  showPage("reviews");
  document.getElementById("reviewInput").focus();
}

/**
 * =========================================================================
 * [다크모드 코어 인터체인지 인터페이스 테마 전환 엔진]
 * 최상단 body 노드의 클래스 리스트를 토글링하고 선택 설정을 로컬 데이터베이스에 영구 기억 기장함
 * =========================================================================
 */
function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light",
  );
}

/**
 * [보안 아키텍처 XSS 악성 코드 쉘 인젝션 방어 유틸]
 * 사용자가 후기란에 악의적으로 <script> 등의 HTML 마크업 구문을 직접 타이핑하여 우회 침투시키는 행위를
 * 원천 무력화하기 위해 브라우저 특수 제어 문자로 치환(replaceAll)하는 보안 인코딩 함수
 */
function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * =========================================================================
 * [애플리케이션 전역 런타임 진입 통제 센터]
 * 브라우저가 화면 요소 마크업 DOM 로드를 끝마치는 즉시 디바이스 저장소 기반 데이터 파이프라인 구동 개시 선언
 * =========================================================================
 */
window.onload = function () {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark");
  }

  updateLoginUi();
  renderReviews();
  renderRecentReviews();
  refreshIcons();
};
