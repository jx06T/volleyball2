// declarations.d.ts
interface Window {
    drawDebug: boolean;
}
declare module '*.png' {
    const value: string;
    export default value;
}
