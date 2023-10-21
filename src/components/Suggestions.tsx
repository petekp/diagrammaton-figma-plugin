import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { pluginContext } from "./PluginContext";
import { useSpring, motion } from "framer-motion";
import { debounce } from "../util";
import styles from "./styles.css";
import { Bold, Link, Stack, Text } from "@create-figma-plugin/ui";

export const suggestionVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
  },
  exit: {
    opacity: 0,
    y: -22,
    height: 0,
  },
  transition: {
    type: "spring",
    damping: 10,
    stiffness: 120,
  },
};

const Suggestions = ({ onClick }: { onClick: (input: string) => void }) => {
  const container = useRef<HTMLDivElement>(null);

  const {
    dispatch,
    state: { isLoading, showSuggestions },
  } = pluginContext();

  const x = useSpring(0);
  const springX = useSpring(x, { stiffness: 120, damping: 30 });

  const handleClick = async (suggestion: string) => {
    await dispatch({
      type: "SET_NATURAL_INPUT",
      payload: suggestion,
    });
    onClick(suggestion);
  };

  const calculateMaxScrollWidth = () => {
    let totalWidth = 0;

    if (container.current && container.current.firstElementChild) {
      Array.from(container.current.firstElementChild.children).forEach(
        (child) => {
          totalWidth += child.getBoundingClientRect().width + 3;
        }
      );
    }

    if (!container.current) {
      return 0;
    }

    return totalWidth - container.current.clientWidth;
  };

  useEffect(() => {
    if (!container.current) return;

    let scrollInterval: NodeJS.Timeout | null = null;
    const rect = container.current.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      if (!rect || !container.current || isLoading) return;

      const xPosition = e.clientX - rect.left;
      const yPosition = e.clientY - rect.top;
      const width = rect.right - rect.left;

      if (scrollInterval) {
        clearInterval(scrollInterval);
      }

      const isMouseWithinBounds =
        yPosition >= 10 && yPosition <= rect.height - 10;
      if (!isMouseWithinBounds) return;

      const isMouseNearLeftEdge = xPosition < width * 0.2;
      const isMouseNearRightEdge = xPosition > width * 0.8;
      const scrollSpeed = isMouseNearLeftEdge
        ? 1 - xPosition / (width * 0.18)
        : isMouseNearRightEdge
        ? (xPosition - width * 0.7) / (width * 0.18)
        : 0;

      if (isMouseNearLeftEdge || isMouseNearRightEdge) {
        scrollInterval = setInterval(() => {
          const maxScrollWidth = calculateMaxScrollWidth();

          // Adjust scroll amount by scrollSpeed
          const scrollAmount = 40 * scrollSpeed;

          if (isMouseNearLeftEdge && x.get() < maxScrollWidth) {
            const newX = Math.min(x.get() + scrollAmount, 0);
            x.set(newX);
          }

          if (isMouseNearRightEdge && x.get() <= 0) {
            const newX = Math.max(x.get() - scrollAmount, -maxScrollWidth);
            x.set(newX);
          }
        }, 10);
      }
    };

    const debouncedHandleMouseMove = debounce(handleMouseMove, 5);

    const handleScroll = (e: WheelEvent) => {
      if (isLoading) return;

      e.preventDefault();
      const maxScrollWidth = calculateMaxScrollWidth();

      // Adjust scroll amount by wheel delta
      const scrollAmount = Math.abs(e.deltaX) + Math.abs(e.deltaY * 20); // Multiply deltaY by 10

      if (e.deltaX < 0 && x.get() < maxScrollWidth) {
        const newX = Math.min(x.get() + scrollAmount, 0);
        x.set(newX);
      }

      if (e.deltaX > 0 && x.get() <= 0) {
        const newX = Math.max(x.get() - scrollAmount, -maxScrollWidth);
        x.set(newX);
      }
    };

    if (container.current) {
      container.current.addEventListener("mousemove", debouncedHandleMouseMove);
      container.current.addEventListener("wheel", handleScroll);
    }

    return () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
      if (container.current) {
        container.current.removeEventListener(
          "mousemove",
          debouncedHandleMouseMove
        );
        container.current.removeEventListener("wheel", handleScroll);
      }
    };
  }, [container.current, isLoading]);

  useEffect(() => {
    const containerElement = container.current;
    const scrollViewElement = containerElement?.firstElementChild;
    if (!containerElement) return;

    let lastFocusOffset = 0;

    const handleFocus = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains(styles.suggestionBlock)) {
        const rect = target.getBoundingClientRect();
        const parentRect = containerElement.getBoundingClientRect();
        const scrollViewRect = scrollViewElement!.getBoundingClientRect();

        // Determine the direction of tabbing
        const isTabbingForwards = rect.left >= lastFocusOffset;
        lastFocusOffset = rect.left;

        // Calculate the desired scroll position to center the focused element
        const desiredScrollLeft =
          rect.left -
          scrollViewRect.left +
          rect.width / 2 -
          parentRect.width / 2;

        // Adjust the scroll position
        if (desiredScrollLeft < 0) {
          x.set(0);
        } else {
          x.set(-desiredScrollLeft);
        }
      }
    };

    const suggestionBlocks = containerElement.querySelectorAll(
      `.${styles.suggestionBlock}`
    );

    suggestionBlocks.forEach((block) => {
      block.addEventListener("focus", handleFocus);
    });

    return () => {
      // Clean up the event listeners
      suggestionBlocks.forEach((block) => {
        block.removeEventListener("focus", handleFocus);
      });
    };
  }, [container.current]);

  return (
    <motion.div layout ref={container} className={styles.suggestionContainer}>
      <motion.div
        layout
        style={{ x: springX }}
        className={styles.suggestionScrollView}
        layoutScroll
      >
        <motion.div layout className={styles.suggestionInstructionsBlock}>
          <Stack space="extraSmall">
            <Text>
              <Bold>Examples</Bold>
            </Text>
            <Text>
              <Link
                href="#"
                onClick={() =>
                  dispatch({
                    type: "SET_SHOW_SUGGESTIONS",
                    payload: !showSuggestions,
                  })
                }
                tabIndex={0}
              >
                Hide
              </Link>
            </Text>
          </Stack>
        </motion.div>
        {suggestions.map((suggestion) => (
          <motion.div
            layout
            tabIndex={0}
            className={styles.suggestionBlock}
            onClick={isLoading ? () => {} : () => handleClick(suggestion)}
            animate={isLoading ? "loading" : "default"}
            initial="default"
            variants={{
              default: {
                outline: "none",
                borderColor: "var(--figma-color-border)",
                backgroundColor: "var(--figma-color-bg-primary)",
                boxShadow: "0px 0px 0px var(--figma-color-bg-brand)",
                color: "var(--figma-color-text)",
              },
              loading: {
                opacity: 0.8,
                borderColor: "var(--figma-color-border)",
                backgroundColor: "var(--figma-color-bg-primary)",
                boxShadow: "0px 0px 0px var(--figma-color-bg-brand)",
                color: "var(--figma-color-text-secondary)",
              },

              hover: {
                y: -2,
                borderColor: "var(--figma-color-bg-brand)",
                backgroundColor: "var(--figma-color-bg-primary)",
                boxShadow: "0px 2px 0px var(--figma-color-bg-brand)",
                color: "var(--figma-color-bg-brand)",
              },
              focus: {
                y: -2,
                borderColor: "var(--figma-color-bg-brand)",
                backgroundColor: "var(--figma-color-bg-primary)",
                boxShadow: "0px 2px 0px var(--figma-color-bg-brand)",
                color: "var(--figma-color-bg-brand)",
              },
              tap: {
                y: 0,
                borderColor: "var(--figma-color-bg-brand)",
                backgroundColor: "var(--figma-color-bg-primary)",
                boxShadow: "0px 2px 0px var(--figma-color-bg-brand)",
                color: "var(--figma-color-bg-brand)",
              },
            }}
            whileHover={isLoading ? "loading" : "hover"}
            whileFocus={isLoading ? "loading" : "focus"}
            whileTap={isLoading ? "loading" : "tap"}
          >
            {suggestion}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

const suggestions = [
  "A mobile app signup flow",
  "Onboarding for a meditation app",
  "Form validation for a login screen",
  "A state diagram of an HTML button",
  "A skippable 5-step app walkthrough",
];

export default Suggestions;
