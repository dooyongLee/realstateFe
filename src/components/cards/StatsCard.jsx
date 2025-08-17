/**
 * 통계 카드 컴포넌트 (StatsCard.jsx)
 * 
 * 이 컴포넌트는 부동산 관리 시스템의 통계 정보를 표시하는 카드 그리드를 제공합니다.
 * 각 통계 항목을 시각적으로 매력적인 카드 형태로 표시하며, 반응형 디자인을 지원합니다.
 * 
 * 주요 기능:
 * - 통계 데이터를 카드 그리드로 표시
 * - 아이콘, 값, 라벨, 서브타이틀을 포함한 카드 구조
 * - 호버 효과 및 애니메이션
 * - 반응형 그리드 레이아웃
 * - 커스터마이징 가능한 스타일링
 * 
 * 비즈니스 규칙:
 * - 카드 수에 따라 자동으로 그리드 크기 조정
 * - 4개 이하: 3칸씩, 5개 이상: 2.4칸씩
 * - 모바일에서는 1칸씩, 태블릿에서는 2칸씩 표시
 * - 호버 시 카드가 위로 올라가는 애니메이션 효과
 * - 각 카드는 고유한 색상 테마를 가짐
 * 
 * 데이터 형식:
 * - 통계 데이터: Array<{ label: string, value: string|number, color: string, avatarColor: string, icon: JSX.Element, subtitle?: string }>
 * - 컨테이너 속성: Object (Grid container 추가 속성)
 * - 카드 속성: Object (Card 컴포넌트 추가 속성)
 * 
 * 사용 예시:
 * 1. 대시보드에서 주요 통계 정보 표시
 * 2. 구독 관리 페이지에서 구독 현황 통계
 * 3. 사용자 관리 페이지에서 사용자 통계
 * 4. 매물 관리 페이지에서 매물 통계
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Box
} from '@mui/material';

/**
 * 공통 통계 카드 컴포넌트
 * 
 * 이 컴포넌트는 통계 데이터를 시각적으로 매력적인 카드 그리드로 표시합니다.
 * 각 카드는 아이콘, 값, 라벨, 서브타이틀을 포함하며, 호버 효과와
 * 반응형 디자인을 지원합니다.
 * 
 * 컴포넌트 구조:
 * StatsCard
 * └── Grid Container
 *     └── Grid Items (각각 Card)
 *         └── CardContent
 *             ├── Avatar (아이콘)
 *             ├── Typography (값)
 *             ├── Typography (라벨)
 *             └── Typography (서브타이틀, 선택적)
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {Array} props.stats - 통계 데이터 배열
 * @param {string} props.stats[].label - 카드 라벨 (예: "총 구독", "활성 구독")
 * @param {string|number} props.stats[].value - 표시할 값 (예: 150, "₩1,000,000")
 * @param {string} props.stats[].color - 값의 텍스트 색상 (예: "#23408e")
 * @param {string} props.stats[].avatarColor - 아바타 배경색 (예: "#23408e")
 * @param {ReactElement} props.stats[].icon - 아이콘 컴포넌트 (React 아이콘)
 * @param {string} [props.stats[].subtitle] - 선택적 서브타이틀 (예: "전체 구독 수")
 * @param {Object} [props.containerProps] - Grid container 추가 속성
 * @param {Object} [props.cardProps] - Card 컴포넌트 추가 속성
 * @returns {JSX.Element} 통계 카드 그리드 UI
 * 
 * 사용 예시:
 * const stats = [
 *   { 
 *     label: '총 구독', 
 *     value: 150, 
 *     color: '#23408e', 
 *     avatarColor: '#23408e',
 *     icon: <PersonIcon />,
 *     subtitle: '전체 구독 수'
 *   }
 * ];
 * <StatsCard stats={stats} />
 */
const StatsCard = ({ 
  stats = [], 
  containerProps = {}, 
  cardProps = {} 
}) => {
  return (
    <Box sx={{ mb: 2, mt: 1 }}>
      {/* 통계 카드 그리드 컨테이너 */}
      <Grid 
        container 
        spacing={1.5} 
        justifyContent="center"
        {...containerProps}
      >
        {stats.map((stat, idx) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={stats.length <= 4 ? 3 : 2.4} 
            key={idx}
          >
            {/* 개별 통계 카드 */}
            <Card 
              sx={{
                height: 'auto',
                minHeight: 90,
                // 그라데이션 배경 (아바타 색상을 기반으로 한 연한 배경)
                background: `linear-gradient(135deg, ${stat.avatarColor}15, ${stat.avatarColor}05)`,
                // 아바타 색상을 기반으로 한 테두리
                border: `1px solid ${stat.avatarColor}20`,
                // 부드러운 전환 효과
                transition: 'all 0.3s ease',
                // 호버 효과: 카드가 위로 올라가고 그림자 효과
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${stat.avatarColor}30`
                },
                // 추가 카드 스타일 속성 병합
                ...cardProps.sx
              }}
              {...cardProps}
            >
              {/* 카드 내용 */}
              <CardContent sx={{ p: 1, textAlign: 'center' }}>
                {/* 아이콘 아바타 */}
                <Avatar sx={{ 
                  bgcolor: stat.avatarColor, 
                  width: 32, 
                  height: 32, 
                  mx: 'auto', 
                  mb: 0.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {stat.icon}
                </Avatar>
                
                {/* 통계 값 (큰 글씨, 굵은 글씨) */}
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: stat.color,
                    mb: 0.25
                  }}
                >
                  {stat.value}
                </Typography>
                
                {/* 통계 라벨 (중간 글씨) */}
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 0.25, fontSize: '0.8rem' }}
                >
                  {stat.label}
                </Typography>
                
                {/* 서브타이틀 (작은 글씨, 선택적) */}
                {stat.subtitle && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ opacity: 0.7, fontSize: '0.7rem' }}
                  >
                    {stat.subtitle}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StatsCard;

