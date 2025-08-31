
export enum AssetType {
  WORKER = '작업자',
  // 토공 장비
  EXCAVATOR = '굴착기',
  DOZER = '불도저',
  LOADER = '로더',
  // 운반 장비
  DUMP_TRUCK = '덤프트럭',
  FORKLIFT = '지게차',
  MIXER_TRUCK = '콘크리트 믹서 트럭',
  // 양중 장비
  TOWER_CRANE = '타워크레인',
  MOBILE_CRANE = '모바일 크레인',
  LIFT_HOIST = '리프트/호이스트',
  // 콘크리트·포장 장비
  PUMP_CAR = '콘크리트 펌프카',
  ASPHALT_FINISHER = '아스팔트 피니셔',
  ROLLER = '롤러',
  // 특수 장비
  PILE_DRIVER = '파일드라이버',
  DRILL_RIG = '드릴 장비',
}

export enum Status {
  SAFE = '안전',
  WARNING = '주의',
  DANGER = '위험',
}

export interface Asset {
  id: number;
  name: string;
  type: AssetType;
  position: [number, number];
  targetPosition?: [number, number];
  workArea?: [number, number]; // For stationary equipment
  status: Status;
  section: string; // The construction section this asset belongs to
}

export interface ConstructionArea {
  center: [number, number];
  radius: number; // in meters
}

export interface SiteSection {
  name: string;
  center: [number, number];
  zoom: number;
}

export interface DangerZone {
  id: number;
  bounds: [number, number][];
  section: string;
}