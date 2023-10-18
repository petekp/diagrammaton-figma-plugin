import { Fragment, h } from "preact";
import {
  Button,
  Container,
  IconWarning32,
  IconCross32,
  VerticalSpace,
  Columns,
  IconArrowRight16,
  IconArrowRightCircle32,
  Link,
  Stack,
  Text,
  Bold,
} from "@create-figma-plugin/ui";
import { pluginContext } from "./PluginContext";
import { emit } from "@create-figma-plugin/utilities";
import { useCallback, useEffect, useRef } from "preact/hooks";

import styles from "./styles.css";
import { debounce, generateTimeBasedUUID } from "../util";
import { createDiagram } from "../createDiagramClient";
import { AutoSizeTextInput } from "./AutoSizeTextInput";
import { ExecutePlugin, DiagramElement } from "../types";
import { StreamElement, fetchStream } from "../fetchDiagramData";
import debug from "../debug";
import { motion, useSpring, AnimatePresence } from "framer-motion";

const suggestionVariants = {
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

const errorVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.92,
  },
};

export function NaturalInputView() {
  const {
    state: {
      naturalInput,
      licenseKey,
      model,
      orientation,
      error,
      isLoading,
      showSuggestions,
    },
    dispatch,
    clearErrors,
  } = pluginContext();

  console.log(showSuggestions);

  let errorMessage = error;
  const diagramId = useRef(generateTimeBasedUUID());
  const diagramNodes = useRef<DiagramElement[]>([]);
  const abortControllerRef = useRef(new AbortController());

  const handleStreamElement = (element: StreamElement) => {
    switch (element.type) {
      case "end":
        break;
      case "message":
        errorMessage += element.data;
        dispatch({
          type: "SET_ERROR",
          payload: errorMessage,
        });
        break;
      case "error":
        dispatch({
          type: "SET_ERROR",
          payload: element.data,
        });
        dispatch({
          type: "SET_IS_LOADING",
          payload: false,
        });
        break;
      case "node":
        if (debug.enabled) console.log(element.data);
        if (element.data) {
          diagramNodes.current = diagramNodes.current.concat(element.data);
        }
        if (diagramNodes.current) {
          handleExecutePlugin({
            diagramNodes: diagramNodes.current,
            diagramId: diagramId.current,
          });
        } else {
          throw new Error("Error drawing diagram.");
        }
        break;
    }
  };

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        console.log("Stream aborted.");
      } else {
        console.error({ err });
      }
    }
  };

  const handleGetCompletionsStream = useCallback(
    async (input: string) => {
      if (!input) {
        return dispatch({
          type: "SET_ERROR",
          payload: "Please enter a description.",
        });
      }
      diagramId.current = generateTimeBasedUUID();
      abortControllerRef.current = new AbortController();
      errorMessage = "";
      clearErrors();
      dispatch({ type: "SET_IS_LOADING", payload: true });

      try {
        for await (const element of fetchStream({
          diagramDescription: input,
          licenseKey,
          model,
          signal: abortControllerRef.current.signal,
        })) {
          handleStreamElement(element);
        }
      } catch (err) {
        handleError(err);
      } finally {
        diagramNodes.current = [];
        dispatch({ type: "SET_IS_LOADING", payload: false });
      }
    },
    [licenseKey, error]
  );

  const handleExecutePlugin = useCallback(
    async function ({
      diagramNodes,
      diagramId,
    }: {
      diagramNodes: DiagramElement[];
      diagramId: string;
    }) {
      if (debug.enabled) console.log(diagramId);
      const positionsObject = await createDiagram({
        parsedOutput: diagramNodes,
        orientation,
      });

      emit<ExecutePlugin>("EXECUTE_PLUGIN", {
        diagram: diagramNodes,
        diagramId,
        stream: true,
        positionsObject,
      });
    },
    [naturalInput]
  );

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    dispatch({
      type: "SET_IS_LOADING",
      payload: false,
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "Enter" && event.ctrlKey) ||
        (event.key === "Enter" && event.metaKey)
      ) {
        handleGetCompletionsStream(naturalInput);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleGetCompletionsStream, naturalInput]);

  const isWindows = navigator.userAgent.indexOf("Win") != -1;

  return (
    <Container
      space="small"
      style={{ display: "flex", flexDirection: "column", flex: 1 }}
    >
      <VerticalSpace space="small" />
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <AutoSizeTextInput
          disabled={isLoading}
          style={{
            lineHeight: 1.3,
            flex: 1,
          }}
          placeholder="I want a diagram of..."
          grow={false}
          spellCheck={false}
          variant="border"
          value={naturalInput}
          onValueInput={(val: string) => {
            dispatch({ type: "SET_NATURAL_INPUT", payload: val });
          }}
          onFocusCapture={clearErrors}
        />
        <AnimatePresence>
          {showSuggestions && (
            <Fragment>
              <motion.div
                id="suggestions"
                layout
                variants={suggestionVariants}
                initial="visible"
                animate="visible"
                exit="exit"
              >
                <VerticalSpace space="small" />
                <Suggestions onClick={handleGetCompletionsStream} />
              </motion.div>
            </Fragment>
          )}
          {error && (
            <motion.div
              id="error"
              layout
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={errorVariants}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className={styles.warningBanner}
            >
              <IconWarning32 />
              <motion.div className={styles.warningText}>{error}</motion.div>
              <IconCross32 onClick={clearErrors} />
            </motion.div>
          )}
        </AnimatePresence>

        <VerticalSpace space="small" />

        <Columns space="extraSmall">
          {isLoading ? (
            <Button
              fullWidth
              secondary
              className={styles.fullWidth}
              onClick={handleCancel}
            >
              Stop
            </Button>
          ) : null}

          <Button
            loading={isLoading}
            fullWidth
            disabled={isLoading}
            className={styles.fullWidth}
            onClick={() => handleGetCompletionsStream(naturalInput)}
          >
            Generate &nbsp; {isWindows ? "Ctrl" : "⌘"} + ⏎
          </Button>
        </Columns>
      </div>
      <VerticalSpace space="small" />
    </Container>
  );
}

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
          <Stack space="small">
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
            variants={{
              loading: {
                opacity: 0.8,
                borderColor: "var(--figma-color-border)",
                backgroundColor: "var(--figma-color-bg-primary)",
                boxShadow: "0px 0px 0px var(--figma-color-bg-brand)",
                color: "var(--figma-color-text-secondary)",
              },
              default: {
                borderColor: "var(--figma-color-border)",
                backgroundColor: "var(--figma-color-bg-primary)",
                boxShadow: "0px 0px 0px var(--figma-color-bg-brand)",
                color: "var(--figma-color-text)",
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
                outline: "none",
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
  "An skippable 5-step app walkthrough",
];
