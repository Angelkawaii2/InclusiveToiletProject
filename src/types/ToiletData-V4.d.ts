//import {DataState} from "./currentData"
export interface GpsCoord {
    lat?: number;
    lon?: number;
    alt?: number;
    accuracy?: number;
    type: string;
}

export interface Accessible {
    isInBinary?: boolean;
    isLocked?: boolean;
}

export interface Extra {
    hasHook?: boolean;
    isFree?: boolean;
    hasDryer?: boolean;
    hasMirror?: boolean;
}

export interface Score {
    recommendation: number;
}

export interface ToiletMetadata {
    isPrivate: boolean;
    accessible: Accessible;
    extra: Extra;
    score: Score;
}

export interface Time {
    unknown: boolean;
    allDay: boolean;
    startTime: string;
    endTime: string;
}

export interface DataState {
    DEBUG: {
        build_date: string | undefined;
        app_version: string | undefined;
    };
    name: string | undefined;
    version: string | undefined;
    timestamp: number;
    gpsCoord: GpsCoord;
    toiletType: number[];
    toiletMetadata: ToiletMetadata;
    time: Time;
    img: any[]; // 更具体的类型可以根据实际情况定义
    comments: string | null;
}
