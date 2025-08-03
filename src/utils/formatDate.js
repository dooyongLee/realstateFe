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
    
    return d.toISOString().slice(0, 10);
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return '-';
  }
}

// 더 상세한 날짜 포맷팅 함수
export function formatDateTime(date) {
  if (!date) {
    return '-';
  }

  try {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
      return '-';
    }
    
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

// 상대적 시간 표시 함수 (예: "3일 전", "1시간 전")
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
    
    if (diffInMinutes < 1) {
      return '방금 전';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else {
      return formatDate(date);
    }
  } catch (error) {
    console.error('상대적 시간 포맷팅 오류:', error);
    return '-';
  }
} 