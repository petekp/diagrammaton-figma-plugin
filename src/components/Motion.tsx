import {
  motion,
  HTMLMotionProps,
  AnimatePresence as OriginalAnimatePresence,
  AnimatePresenceProps as OriginalAnimatePresenceProps,
} from "framer-motion";

type MotionDivProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: any;
};

export const MotionDiv = motion.div as unknown as (
  props: MotionDivProps
) => JSX.Element;

type MotionSpanProps = Omit<HTMLMotionProps<"span">, "children"> & {
  children?: any;
};

export const MotionSpan = motion.span as unknown as (
  props: MotionSpanProps
) => JSX.Element;

type AnimatePresenceProps = Omit<OriginalAnimatePresenceProps, "children"> & {
  children?: any;
};

export const AnimatePresence = OriginalAnimatePresence as unknown as (
  props: AnimatePresenceProps
) => JSX.Element;
