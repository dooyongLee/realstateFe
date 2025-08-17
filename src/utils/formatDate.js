/**
 * 날짜 포맷팅 유틸리티 (formatDate.js)
 * 
 * 이 파일은 부동산 관리 시스템에서 사용되는 날짜 관련 포맷팅 함수들을 제공합니다.
 * 다양한 날짜 형식을 일관되게 표시하고, 에러 처리를 포함한 안전한 날짜 변환을 지원합니다.
 * 
 * 주요 기능:
 * - 기본 날짜 포맷팅 (YYYY-MM-DD)
 * - 날짜시간 포맷팅 (한국 로케일)
 * - 상대적 시간 표시 (방금 전, 3일 전 등)
 * - 안전한 날짜 변환 및 에러 처리
 * - null/undefined 값 처리
 * 
 * 비즈니스 규칙:
 * - 날짜가 null, undefined, 빈 문자열인 경우 '-' 반환
 * - 유효하지 않은 날짜인 경우 '-' 반환
 * - 에러 발생 시 콘솔에 로그 출력 후 '-' 반환
 * - 상대적 시간은 7일 이내만 표시, 그 이상은 절대 날짜로 표시
 * - 한국 로케일 기준으로 날짜시간 포맷팅
 * 
 * 데이터 형식:
 * - 입력: Date 객체, ISO 문자열, 타임스탬프 등
 * - 출력: 포맷된 문자열 또는 '-'
 * 
 * 사용 예시:
 * 1. 구독 시작일/만료일 표시
 * 2. 사용자 생성일 표시
 * 3. 매물 등록일 표시
 * 4. 최근 활동 시간 표시
 */

/**
 * 기본 날짜 포맷팅 함수
 * 
 * 날짜를 'YYYY-MM-DD' 형식으로 포맷팅합니다.
 * 시간 정보는 제거하고 날짜만 표시합니다.
 * 
 * @param {Date|string|number} date - 포맷팅할 날짜
 * @returns {string} 포맷된 날짜 문자열 또는 '-'
 * 
 * 처리 과정:
 * 1. 입력값 유효성 검사 (null, undefined, 빈 문자열 체크)
 * 2. Date 객체 생성
 * 3. 유효한 날짜인지 확인 (isNaN 체크)
 * 4. ISO 문자열로 변환 후 날짜 부분만 추출 (YYYY-MM-DD)
 * 5. 에러 발생 시 '-' 반환
 * 
 * 사용 예시:
 * formatDate('2024-01-15T10:30:00Z') // '2024-01-15'
 * formatDate(new Date()) // '2024-01-15'
 * formatDate(null) // '-'
 * formatDate('invalid-date') // '-'
 */
export function formatDate(date) {
  // 날짜가 null, undefined, 또는 빈 문자열인 경우
  if (!date) {
    return '-';
  }

  try {
    const d = new Date(date);
    
    // 유효하지 않은 날짜인 경우 (Invalid Date)
    if (isNaN(d.getTime())) {
      return '-';
    }
    
    // ISO 문자열로 변환 후 날짜 부분만 추출 (YYYY-MM-DD)
    return d.toISOString().slice(0, 10);
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return '-';
  }
}

/**
 * 상세한 날짜시간 포맷팅 함수
 * 
 * 날짜와 시간을 한국 로케일 기준으로 포맷팅합니다.
 * 'YYYY-MM-DD HH:MM:SS' 형식으로 표시됩니다.
 * 
 * @param {Date|string|number} date - 포맷팅할 날짜시간
 * @returns {string} 포맷된 날짜시간 문자열 또는 '-'
 * 
 * 처리 과정:
 * 1. 입력값 유효성 검사
 * 2. Date 객체 생성
 * 3. 유효한 날짜인지 확인
 * 4. 한국 로케일로 날짜시간 포맷팅
 * 5. 에러 발생 시 '-' 반환
 * 
 * 포맷팅 옵션:
 * - year: 'numeric' - 4자리 연도
 * - month: '2-digit' - 2자리 월
 * - day: '2-digit' - 2자리 일
 * - hour: '2-digit' - 2자리 시간
 * - minute: '2-digit' - 2자리 분
 * - second: '2-digit' - 2자리 초
 * 
 * 사용 예시:
 * formatDateTime('2024-01-15T10:30:00Z') // '2024. 01. 15. 오전 10:30:00'
 * formatDateTime(new Date()) // '2024. 01. 15. 오후 02:30:45'
 * formatDateTime(null) // '-'
 */
export function formatDateTime(date) {
  if (!date) {
    return '-';
  }

  try {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
      return '-';
    }
    
    // 한국 로케일로 날짜시간 포맷팅
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.error('날짜시간 포맷팅 오류:', error);
    return '-';
  }
}

/**
 * 상대적 시간 표시 함수
 * 
 * 현재 시간을 기준으로 상대적인 시간을 표시합니다.
 * 예: "방금 전", "3분 전", "2시간 전", "5일 전"
 * 7일 이상 지난 경우 절대 날짜로 표시합니다.
 * 
 * @param {Date|string|number} date - 비교할 날짜
 * @returns {string} 상대적 시간 문자열 또는 절대 날짜
 * 
 * 처리 과정:
 * 1. 입력값 유효성 검사
 * 2. Date 객체 생성
 * 3. 현재 시간과의 차이 계산 (밀리초)
 * 4. 차이를 분, 시간, 일 단위로 변환
 * 5. 시간 차이에 따라 적절한 메시지 반환
 * 
 * 시간 구분 기준:
 * - 1분 미만: "방금 전"
 * - 1시간 미만: "N분 전"
 * - 24시간 미만: "N시간 전"
 * - 7일 미만: "N일 전"
 * - 7일 이상: 절대 날짜 (YYYY-MM-DD)
 * 
 * 사용 예시:
 * formatRelativeTime('2024-01-15T10:30:00Z') // '5일 전' (현재가 2024-01-20인 경우)
 * formatRelativeTime(new Date()) // '방금 전'
 * formatRelativeTime('2024-01-10T10:30:00Z') // '2024-01-10' (7일 이상 지난 경우)
 * formatRelativeTime(null) // '-'
 */
export function formatRelativeTime(date) {
  if (!date) {
    return '-';
  }

  try {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
      return '-';
    }
    
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    // 시간 차이에 따라 적절한 메시지 반환
    if (diffInMinutes < 1) {
      return '방금 전';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else {
      // 7일 이상 지난 경우 절대 날짜로 표시
      return formatDate(date);
    }
  } catch (error) {
    console.error('상대적 시간 포맷팅 오류:', error);
    return '-';
  }
} 