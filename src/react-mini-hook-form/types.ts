export type FormState = Record<string, string>;
export type Subscribers = Record<string, ((arg: string) => void)[]>;
