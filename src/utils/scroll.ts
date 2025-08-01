import { useResizeObserver, useScroll } from "@vueuse/core";

export const useBottomScroll = (options: {
  target: MaybeRefOrGetter<HTMLElement | null>;
  watchElement: MaybeRefOrGetter<HTMLElement | null>;
}) => {
  const scrollBottom = ref(0);

  const writeScrollBottom = () => {
    const target = toValue(options.target);
    if (!target) return 0;
    const { scrollHeight, clientHeight } = target;
    scrollBottom.value = scrollHeight - clientHeight - y.value;
  };

  const { y, directions } = useScroll(options.target, {
    onScroll() {
      writeScrollBottom();
    },
  });

  const scrollToBottom = () => {
    const target = toValue(options.target);
    if (!target) return;
    target.scrollTo({
      top: target.scrollHeight,
      behavior: "instant",
    });
  };

  useResizeObserver(options.watchElement, () => {
    if (directions.top) return;
    if (scrollBottom.value > 30) return;
    const target = toValue(options.target);
    if (!target) return;
    const { scrollHeight, clientHeight } = target;
    const scrollTop = scrollHeight - clientHeight - scrollBottom.value;
    target.scrollTo({
      top: scrollTop,
      behavior: "instant",
    });
  });

  return {
    scrollBottom,
    scrollToBottom,
  };
};
