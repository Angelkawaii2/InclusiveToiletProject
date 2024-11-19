
import {defineStore} from "pinia";

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

/*const APP_VERSION = import.meta.env.VITE_APP_VERSION;
const buildTime = import.meta.env.VITE_BUILD_TIME;
const DATA_VERSION = import.meta.env.VITE_DATA_VERSION;*/
const APP_VERSION = import.meta.env.VITE_APP_VERSION;
const buildTime = import.meta.env.VITE_BUILD_TIME;
const DATA_VERSION = import.meta.env.VITE_DATA_VERSION;

// 定义store
export const useCurrentData = defineStore('mydata', {
    state: (): DataState => initData(),
    actions: {
        reset() {
            // 使用$patch重置状态
            this.$patch(initData());
        }
    }
});

// 初始化数据的函数
function initData(): DataState {
    return {
        DEBUG: {
            build_date: VITE_BUILD_TIME,
            app_version: VITE_APP_VERSION //todo 先硬编码之后再修
        },
        version: VITE_DATA_VERSION,
        name: undefined,
        timestamp: 0,
        gpsCoord: {
            lat: null,
            lon: null,
            alt: undefined,
            accuracy: undefined,
            type: "wgs84"
        },
        toiletType: [1],
        toiletMetadata: {
            isPrivate: false,
            accessible: {
                isInBinary: null,
                isLocked: null,
            },
            extra: {
                hasHook: undefined,
                isFree: true,
                hasDryer: undefined,
                hasMirror: undefined,
            },
            score: {
                recommendation: 0
            }
        },
        time: {
            unknown: false,
            allDay: false,
            startTime: "08:00",
            endTime: "22:00",
        },
        img: [],
        comments: ""
    };
}