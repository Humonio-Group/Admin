export function useSticky() {
  const observed = useTemplateRef<HTMLElement | null>("observed");
  const isStuck = ref<boolean>(false);

  let observer: IntersectionObserver | null = null;
  let sentinel: HTMLElement | null = null;

  function cleanup() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (sentinel) {
      sentinel.remove();
      sentinel = null;
    }
    isStuck.value = false;
  }

  watch(observed, (el) => {
    cleanup();
    if (!el) return;

    sentinel = document.createElement("div");
    sentinel.setAttribute("class", "h-0");
    el.parentElement?.insertBefore(sentinel, el);

    const computedTop = parseFloat(getComputedStyle(el).top) || 0;

    observer = new IntersectionObserver(
      ([entry]) => { isStuck.value = !entry?.isIntersecting; },
      { rootMargin: `-${computedTop}px 0px 0px 0px` },
    );
    observer.observe(sentinel);
  });

  onBeforeUnmount(cleanup);

  return { observed, isStuck };
}
