export interface Loc {
    lat: number;
    lon: number;
    alt?: number ;
    accuracy: number;
    type: string;
}

export interface Facilities {
    hasAccessibilityFeatures: boolean;
    hasHook: boolean;
    hasDryer: boolean;
    hasMirror: boolean;
    hasShower: boolean;
}

export interface Accessible {
    isLocked: boolean;
    comments: string;
}

export interface Time {
    allDay: boolean;
    openAt: string;
    closeAt: string;
}

export interface Comment {
    author: string;
    authorUID: string;
    text: string;
    ratings: number;
    timestamp: number;
    signature: string;
    algorithm: string;
}

export interface Properties {
    inPrivateArea: boolean;
    isFree: boolean;
    facilities: Facilities;
}

export interface Extra {
    identifiers: string[];
}

export interface Debug {
    build_date: string;
    app_version: string;
}

export interface Bathroom {
    DEBUG?: Debug;
    version?: string;
    name: string;
    isDisabled?: boolean;
    lastUpdateAt: number;
    loc: Loc;
    types: string[];
    accessible: Accessible;
    properties: Properties;
    extra?: Extra;
    time?: Time;
    images?: string[];
    comments?: Comment[];
}
