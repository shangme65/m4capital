// Type declaration for WebAssembly trading engine module
declare module '/trading_engine.js' {
  interface TradingEngineModule {
    ccall: (funcName: string, returnType: string, argTypes: string[], args: any[]) => any;
    cwrap: (funcName: string, returnType: string, argTypes: string[]) => any;
    _malloc: (size: number) => number;
    _free: (ptr: number) => void;
    stringToUTF8: (str: string, ptr: number, maxLength: number) => void;
    UTF8ToString: (ptr: number) => string;
  }

  const TradingEngineModuleFactory: () => Promise<TradingEngineModule>;
  export default TradingEngineModuleFactory;
}