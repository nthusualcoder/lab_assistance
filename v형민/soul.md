# 어플리케이션 제작 핵심 수칙 - 형민 버전 (soul.md)

본 문서는 실험 보조 계산기 - 형민 버전 앱을 설계, 구현, 유지보수할 때 반드시 준수해야 하는 디자인 철학, 아키텍처 규칙 및 연산 수식을 규정합니다.

---

## 1. UI & UX 디자인 수칙 (Toss Style)

### 1.1. 테마 및 컬러 팔레트
- **배경색 (Background)**: `#0f1722` (다크 테마가 기본으로 작동)
- **카드/컨테이너 배경**: `#182230`
- **브랜드 테마 컬러 (Orange)**: `#ffa000` (확인 버튼, 탭 활성 상태, 하이라이트)
- **보조 오렌지 (Light Orange)**: rgba(255, 160, 0, 0.2) (비활성 선택 상태, 프리셋 활성화 백그라운드)
- **경고/에러 컬러 (Error Red)**: `#f25549` (입력값 오류 및 경고 메시지)
- **테두리선 (Divider/Border)**: `#2c3a4e`

### 1.2. 스페로이드 시각 지표 컬러
- **세포 현탁액 원액 (Cell Stock Portion)**: `#ffa000` (Toss 오렌지색)
- **새 배지 (Media Portion)**: `#ff6584` (Toss 핑크색)

---

## 2. 코드 아키텍처 및 포트 구성

- **로컬 웹 서버 작동 포트**: **`8001`** (기존 v1과의 포트 충돌 방지)
- **PWA 서비스 워커 및 명세**: 
  - 앱 이름: `"실험계산기-형민"`
  - 스코프: `v형민` 하위 폴더 상대 경로 기준 캐싱

---

## 3. 기능성 및 물리 수식 명세

### 3.1. Collagen 제조 용량 계산기
- **기본 고정 비율**: `Collagen : 10xPBS : 1M NaOH = 40 : 4 : 1` (부피 비율)
  - $V_{PBS} = V_{col} \times 0.1$
  - $V_{NaOH} = V_{col} \times 0.025$
- **시약 정렬 순서**: `콜라겐 -> 10X PBS -> SFM -> 1M NaOH`
- **SFM 및 총 부피 계산 공식**:
  - $V_{total} = V_{col} \times (C_{init} / C_{target})$
  - $V_{SFM} = V_{total} - 1.125 \times V_{col}$
- **농도 프리셋 종류**:
  - 프리셋 1: 시작 `8.64` -> 목표 `6` mg/mL
  - 프리셋 2: 시작 `3.75` -> 목표 `3` mg/mL
  - 프리셋 3: 직접 입력 (Custom)

### 3.2. Hemocytometer 세포 카운팅 계산기
- **세포 농도 계산 공식**:
  - 16칸 전체 측정 기준: $C_{cell} = N \times 2 \times 10^4 \text{ cells/mL}$
- **하위 기능 2.1: 필요한 세포 수 수확 (Harvest)**:
  - $V_{harvest} = \frac{T_{target}}{C_{cell}} \times 1000\ \mu\text{L}$
- **하위 기능 2.2: 특정 세포 농도/부피 제조 (Dilution)**:
  - $V_{cell} = V_{target} \times \frac{C_{target}}{C_{cell}} \times 1000\ \mu\text{L}$
  - $V_{media} = (V_{target} \times 1000) - V_{cell}\ \mu\text{L}$

### 3.3. Microwell Spheroid 계산기 [신규]
일정량의 세포 현탁액(Stock)을 이용해 스페로이드를 배양하기 위한 현탁 희석액 조제법 계산.

1. **원액 세포 농도 ($C_{current}$)**:
   $$C_{current} = \text{총 카운팅 세포 수 (16칸 전체)} \times 20,000\ \text{cells/mL}$$
   - **보유 총 세포 수 ($N_{total}$)**:
     $$N_{total} = C_{current} \times V_{current}\ (\text{현재 현탁액 부피 (mL)})$$

2. **목표 분주 용량 계산**:
   - **Well당 필요 세포 수 ($N_{well}$)**:
     $$N_{well} = \text{웰 당 microwell 개수} \times \text{microwell당 세포 수}$$
   - **Plate 전체 필요 세포 수 ($N_{plate}$)**:
     $$N_{plate} = N_{well} \times \text{Plate당 Well 수}$$
   - **목표 총 필요 세포 수 ($N_{required}$)**:
     $$N_{required} = N_{well} \times \text{최종 분주 준비 부피 (mL)}$$

3. **조제 레시피 공식**:
   - **따내야 할 세포 현탁액 원액 부피 ($V_{take}$, $\mu\text{L}$)**:
     $$V_{take} = \frac{N_{required}}{C_{current}} \times 1000\ \mu\text{L}$$
   - **추가해야 할 새 배지(Media) 부피 ($V_{media}$, $\mu\text{L}$)**:
     $$V_{media} = (\text{최종 분주 준비 부피} \times 1000) - V_{take}\ \mu\text{L}$$

4. **제약 및 예외 조건**:
   - **보유 세포 수 부족**: 필요한 총 세포 수 $N_{required}$가 현재 보유 중인 총 세포 수 $N_{total}$보다 많은 경우 제조 불가 경고 노출.
   - **희석 조제 불가능**: 따내야 할 부피 $V_{take}$가 최종 제조 부피보다 큰 경우(즉, 목표 농도가 원액 농도보다 높은 경우) 제조 불가 경고 노출.
   - **UI 깨짐 방지**: 레이블이 매우 긴 스페로이드 설정의 특성을 감안해 인풋 필드를 세로로 1열 정렬하여 모바일 화면에서 겹치거나 깨지는 현상을 방지합니다.
