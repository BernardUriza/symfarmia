declare module 'react' {
  export interface RefObject<T> { current: T | null }
  export type ChangeEvent<T = Element> = any;
  export function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prev: S) => S)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<unknown>): void;
  export function useMemo<T>(factory: () => T, deps: ReadonlyArray<unknown>): T;
  export function useReducer<R extends (state: any, action: any) => any>(reducer: R, initialState: Parameters<R>[0]): [Parameters<R>[0], (action: Parameters<R>[1]) => void];
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps: ReadonlyArray<any>): T;
  export function useRef<T>(initialValue: T | null): RefObject<T>;
  export interface Context<T> {
    Provider: any;
    Consumer: any;
  }
  export function createContext<T>(defaultValue: T): Context<T>;
  export function useContext<T>(context: Context<T>): T;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elem: string]: any;
  }
}
