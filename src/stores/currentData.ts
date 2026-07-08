import {defineStore} from "pinia";
import {Bathroom} from "@/types/ToiletData-V5";

// const APP_VERSION = import.meta.env.VITE_APP_VERSION;
// const buildTime = import.meta.env.VITE_BUILD_TIME;
// const DATA_VERSION = import.meta.env.VITE_DATA_VERSION;

// 定义store
export const useCurrentData = defineStore('mydata', {
    state: (): Bathroom => initData(),
    actions: {
        loadExample() {
            this.$patch(initExampleData());
        },
        initTime(clear: boolean = false) {
            if (clear) {
                this.time = {};
            } else {
                this.time.allDay = false;
                this.time.openAt = "08:00";
                this.time.closeAt = "22:00";
            }
        },
        updateTypes(types: string[]) {
            //不一定需要，但是以防数据可能有问题..?
            //todo 应该在数据导入时做处理，这段以后可以删掉
            if (types.includes("accessible")) {
                this.accessible.isLocked = false;
                this.accessible.comments = "";
            } else {
                this.accessible.isLocked = undefined;
                this.accessible.comments = undefined;
            }
            this.types = types;
        },
        reset() {
            // 使用$patch重置状态
            this.$patch(initData());
        }
    }
});

// 初始化数据的函数
function initData(): Bathroom {
    return {
        DEBUG: {
            build_date: VITE_BUILD_TIME,
            app_version: VITE_APP_VERSION
        },
        version: VITE_DATA_VERSION,
        name: undefined,
        lastUpdateAt: Date.now(),
        isDisabled: false,
        loc: {
            lat: undefined,
            lon: undefined,
            alt: undefined,
            accuracy: undefined,
            type: "wgs84"
        },
        types: [
            'binary',
        ],
        properties: {
            inPrivateArea: false,
            isFree: true,
            facilities: {},
        },
        accessible: {
            //accessible 卫生间是否上锁
            isLocked: undefined,
            comments: undefined
        },
        extra: {
            identifiers: [],
        },
        time: {
            allDay: false,
            openAt: "08:00",
            closeAt: "22:00"
        },
        images: [],
        comments: []
    };
}

function initExampleData(): Bathroom {
    return {
        DEBUG: {
            build_date: "",
            app_version: ""
        },
        version: "20240628",
        name: "测试卫生间",
        lastUpdateAt: 1726413428773,
        loc: {
            lat: 114.514,
            lon: 19.19810,
            alt: null,
            accuracy: 212,
            type: "wgs84"
        },
        types: [
            //性别中立（无性别单间）
            'unisex',
            //第三/无障碍/家庭卫生间（指完全独立的，非二元性别内的无障碍设施）
            'accessible',
            'other'
        ],
        properties: {
            inPrivateArea: false,
            isFree: true,
            facilities: {
                hasAccessibilityFeatures: true,
                hasHook: false,

                hasDryer: false,
                hasMirror: false,
                hasShower: true,
            },
        },
        accessible: {
            //accessible 卫生间是否上锁
            isLocked: null,
            comments: ""
        },
        extra: {
            identifiers: [],
        },
        time: {
            allDay: false,
            openAt: "08:00",
            closeAt: "22:00"
        },
        images: [],
        comments: [
            {
                author: "test",
                authorUID: "blablablabla",//爱起什么都行，例如邮箱等
                text: "在静安寺地铁站，苹果店旁边，不太好找",
                ratings: 5,
                timestamp: 1145141919,
                signature: "signed_data_hash",
                algorithm: "RSA-SHA256"
            }
        ]
    };
}
