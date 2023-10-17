import { h } from "preact";
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
} from "@create-figma-plugin/ui";
import { pluginContext } from "./PluginContext";
import { emit } from "@create-figma-plugin/utilities";
import { useCallback, useEffect, useRef } from "preact/hooks";

import styles from "./styles.css";
import { generateTimeBasedUUID } from "../util";
import { createDiagram } from "../createDiagramClient";
import { AutoSizeTextInput } from "./AutoSizeTextInput";
import { ExecutePlugin, DiagramElement } from "../types";
import { StreamElement, fetchStream } from "../fetchDiagramData";
import debug from "../debug";
import { motion, useSpring, AnimatePresence } from "framer-motion";

const variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  transition: { type: "spring", damping: 20, stiffness: 300 },
};

export function NaturalInputView() {
  const {
    state: { naturalInput, licenseKey, model, orientation, error, isLoading },
    dispatch,
    clearErrors,
  } = pluginContext();

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

  const handleGetCompletionsStream = useCallback(async () => {
    diagramId.current = generateTimeBasedUUID();
    abortControllerRef.current = new AbortController();
    errorMessage = "";
    clearErrors();
    dispatch({ type: "SET_IS_LOADING", payload: true });

    try {
      for await (const element of fetchStream({
        diagramDescription: naturalInput,
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
  }, [naturalInput, licenseKey, error]);

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
        handleGetCompletionsStream();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleGetCompletionsStream]);

  const isWindows = navigator.userAgent.indexOf("Win") != -1;

  return (
    <Container
      space="small"
      style={{ display: "flex", flexDirection: "column", flex: 1 }}
    >
      <VerticalSpace space="small" />
      <div
        style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}
      >
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
        <Suggestions onClick={handleGetCompletionsStream} />
        <AnimatePresence>
          {error && (
            <motion.div
              layout
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              className={styles.warningBanner}
            >
              <IconWarning32 />
              <div className={styles.warningText}>{error}</div>
              <IconCross32 onClick={clearErrors} />
            </motion.div>
          )}
        </AnimatePresence>
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
            onClick={handleGetCompletionsStream}
          >
            Generate &nbsp; {isWindows ? "Ctrl" : "⌘"} + ⏎
          </Button>
        </Columns>
      </div>
      <VerticalSpace space="small" />
    </Container>
  );
}

const Suggestions = ({ onClick }: { onClick: () => void }) => {
  const container = useRef<HTMLDivElement>(null);

  const { dispatch } = pluginContext();

  const x = useSpring(0);
  const springX = useSpring(x, { stiffness: 120, damping: 30 });

  const handleClick = async (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains(styles.suggestionBlock)) {
      await dispatch({
        type: "SET_NATURAL_INPUT",
        payload: "A basic auth flow",
      });
      onClick();
    }
  };

  useEffect(() => {
    let scrollInterval: NodeJS.Timeout | null = null;
    const rect = container.current?.getBoundingClientRect();

    const calculateMaxScrollWidth = () => {
      let totalWidth = 0;
      if (container.current) {
        Array.from(container.current.firstElementChild.children).forEach(
          (child) => {
            totalWidth += child.getBoundingClientRect().width + 3;
          }
        );
      }

      console.log(totalWidth, container.current?.clientWidth);
      return totalWidth - container.current?.clientWidth;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!rect || !container.current) return;

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

      console.log(calculateMaxScrollWidth());

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

    if (container.current) {
      container.current.addEventListener("mousemove", debouncedHandleMouseMove);
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
      }
    };
  }, [container.current]);

  const sharedProps = {
    whileHover: {
      y: -4,
      backgroundColor: "var(--figma-color-bg-primary)",

      boxShadow:
        "0px 4px 0px rgba(0, 0, 0, 0.1), inset 0 0 0 0.5px rgba(0,0,0,0.2)",
      transition: { type: "spring", damping: 20, stiffness: 300 },
    },
  };

  return (
    <div ref={container} className={styles.suggestionContainer}>
      <motion.div
        style={{ x: springX }}
        className={styles.suggestionScrollView}
        layoutScroll
      >
        <motion.div className={styles.suggestionInstructionsBlock}>
          Examples <IconArrowRight16 />
          <Link href="">Hide</Link>
        </motion.div>
        <motion.div
          {...sharedProps}
          className={styles.suggestionBlock}
          onClick={handleClick}
        >
          A basic auth flow
        </motion.div>
        <motion.div {...sharedProps} className={styles.suggestionBlock}>
          Design system change management stuff and other things haha
        </motion.div>
        <motion.div {...sharedProps} className={styles.suggestionBlock}>
          A state diagram of an HTML button
        </motion.div>
        <motion.div {...sharedProps} className={styles.suggestionBlock}>
          Test suggestion 4
        </motion.div>
        <motion.div {...sharedProps} className={styles.suggestionBlock}>
          Test suggestion 4
        </motion.div>
        <motion.div {...sharedProps} className={styles.suggestionBlock}>
          Test suggestion 4
        </motion.div>
        <motion.div {...sharedProps} className={styles.suggestionBlock}>
          Test suggestion 4
        </motion.div>
        <motion.div {...sharedProps} className={styles.suggestionBlock}>
          Test suggestion 4
        </motion.div>
        <motion.div {...sharedProps} className={styles.suggestionBlock}>
          Test suggestion 4
        </motion.div>
        <motion.div {...sharedProps} className={styles.suggestionBlock}>
          Test suggestion 4
        </motion.div>
        <motion.div {...sharedProps} className={styles.suggestionBlock}>
          Test suggestion 4
        </motion.div>
        <motion.div {...sharedProps} className={styles.suggestionBlock}>
          Test suggestion 4
        </motion.div>
        <motion.div {...sharedProps} className={styles.suggestionBlock}>
          Test suggestion 4
        </motion.div>
        <motion.div {...sharedProps} className={styles.suggestionBlock}>
          Test suggestion 4
        </motion.div>
        <motion.div {...sharedProps} className={styles.suggestionBlock}>
          Test suggestion 4
        </motion.div>
      </motion.div>
    </div>
  );
};

// Define a simple debounce function
function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: any[]) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
