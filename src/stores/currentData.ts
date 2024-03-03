import {defineStore} from "pinia";

interface GpsCoord {
    lat?: number;
    lon?: number;
    alt?: number;
    accuracy?: number;
    type: string;
}

interface Accessible {
    isInBinary?: boolean;
    isLocked?: boolean;
}

interface Extra {
    hasHook?: boolean;
    isFree?: boolean;
    hasDryer?: boolean;
    hasMirror?: boolean;
}

interface Score {
    recommendation: number;
}

interface ToiletMetadata {
    isPrivate: boolean;
    accessible: Accessible;
    extra: Extra;
    score: Score;
}

interface Time {
    unknown: boolean;
    allDay: boolean;
    startTime: string;
    endTime: string;
}

interface DataState {
    DEBUG: {
        build_date: string | undefined;
        app_version: string | undefined;
    };
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
            build_date: buildTime,
            app_version: "v0.2.0-dev4" //todo 先硬编码之后再修
        },
        version: DATA_VERSION,
        timestamp: 0,
        gpsCoord: {
            lat: undefined,
            lon: undefined,
            alt: undefined,
            accuracy: undefined,
            type: "wgs84"
        },
        toiletType: [1],
        toiletMetadata: {
            isPrivate: false,
            accessible: {
                isInBinary: undefined,
                isLocked: undefined,
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