export const useBottomScroll = (options: {
  target: MaybeRefOrGetter<HTMLElement | null>;
  watchElement: MaybeRefOrGetter<HTMLElement | null>;
}) => {
  const { y, directions } = useScroll(options.target);

  const scrollBottom = computed(() => {
    const target = toValue(options.target);
    if (!target) return 0;
    const { scrollHeight, clientHeight } = target;
    return scrollHeight - clientHeight - y.value;
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
    scrollToBottom();
  });

  return {
    scrollBottom,
    scrollToBottom,
  };
};
