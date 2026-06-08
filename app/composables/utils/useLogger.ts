export function useLogger(prefix?: string) {
  const env = useRuntimeConfig().public.env;

  const call = (cb: (...args: any) => void) => {
    if (env !== "development") return;
    cb();
  };

  const log = (...args: any) => call(() => console.log(prefix, ...args));
  const error = (...args: any) => call(() => console.error(prefix, ...args));
  const warn = (...args: any) => call(() => console.warn(prefix, ...args));

  return {
    log,
    error,
    warn,
  };
}
