/// <reference types="vite/client" />
interface ImportMetaEnv {
    VITE_APP_VERSION: string;
    VITE_BUILD_TIME: string;
    VITE_DATA_VERSION: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare const VITE_APP_VERSION: string;
declare const VITE_BUILD_TIME: string;
declare const VITE_DATA_VERSION: string;

declare module "*.vue" {
    import type {DefineComponent} from "vue";
    const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
    export default component;
}

declare module "virtual:pwa-register" {
    export function registerSW(options?: {
        immediate?: boolean;
        onNeedRefresh?: () => void;
        onOfflineReady?: () => void;
        onRegistered?: (registration?: ServiceWorkerRegistration) => void;
        onRegisterError?: (error: unknown) => void;
    }): (reloadPage?: boolean) => Promise<void>;
}
