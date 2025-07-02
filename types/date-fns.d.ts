declare module 'date-fns' {
  export type Locale = unknown;
  export function format(date: Date | number, formatStr: string, options?: { locale?: Locale }): string;
  export function parseISO(dateString: string): Date;
  export function isValid(date: Date): boolean;
  export function addDays(date: Date | number, amount: number): Date;
  export function subDays(date: Date | number, amount: number): Date;
  export function startOfDay(date: Date | number): Date;
  export function endOfDay(date: Date | number): Date;
  export function differenceInDays(dateLeft: Date | number, dateRight: Date | number): number;
}

declare module 'date-fns/locale' {
  export const es: unknown;
}
