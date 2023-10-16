import { h } from "preact";
import {
  Banner,
  IconLockLocked32,
  IconLockUnlocked32,
  IconWarning32,
  Link,
  LoadingIndicator,
  MiddleAlign,
  Stack,
  Text,
  Textbox,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { useState } from "preact/hooks";
import { AnimationProps, motion } from "framer-motion";

import styles from "./styles.css";
import Logo from "./Logo";
import { pluginContext } from "./PluginContext";
import { verifyLicenseKey } from "../verifyLicenseKey";

import StarArrows from "./StarArrows";
import { getBaseUrl } from "../util";
import { useEffect } from "react";
import debug from "../debug";
import DiamondAnimation from "./DiamondBg";

const restDelta = 0.005;
const DIAMONDS_NUM = 60;

const arrowsDelay = 0.5;
const arrowsDamping = 30;
const arrowsStiffness = 90;

const diamondDelay = 0.5;

const logoDelay = diamondDelay + 0.13;
const logoDamping = 13;
const logoStiffness = 110;

const containerDelay = logoDelay + 2.4;
const containerDamping = 40;
const containerStiffness = 160;

const lettersDelay = containerDelay + 0.3;

const descriptionDelay = lettersDelay + 1;
const descriptionDamping = 20;
const descriptionStiffness = 60;

const signInDelay = descriptionDelay + 0.4;
const signInDamping = 20;
const signInStiffness = 60;

const footerDelay = signInDelay + 2;

const arrowsAnimation: AnimationProps = {
  initial: {
    opacity: 0,
    scale: 0.2,
  },
  animate: {
    opacity: 0.32,
    scale: 1,
    transition: {
      type: "spring",
      damping: arrowsDamping,
      stiffness: arrowsStiffness,
      restDelta: restDelta,
      delay: arrowsDelay,
    },
  },
};

const containerAnimation: AnimationProps = {
  initial: "centered",
  animate: "raised",
  variants: {
    centered: { y: 68 },
    raised: {
      y: -20,
      transition: {
        type: "spring",
        damping: containerDamping,
        stiffness: containerStiffness,
        delay: containerDelay,
      },
    },
  },
};

const staggerAnimation: AnimationProps = {
  initial: "hidden",
  animate: "visible",
  variants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        type: "spring",
        damping: 50,
        stiffness: 50,
        delayChildren: lettersDelay,
        staggerChildren: 0.05,
      },
    },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 1.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: logoDamping,
      stiffness: logoStiffness,
      delay: logoDelay,
      restDelta: restDelta,
    },
  },
};

const letterAnimation: AnimationProps = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { type: "spring", damping: 30, stiffness: 170 },
  },
};

const descriptionVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: descriptionDamping,
      stiffness: descriptionStiffness,
      delay: descriptionDelay,
      restDelta: restDelta,
    },
  },
};

const signInVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: signInDamping,
      stiffness: signInStiffness,
      delay: signInDelay,
      restDelta: restDelta,
    },
  },
};

const licenseKeyLength = 18;

function SignIn() {
  const {
    state: { isNewUser, error, isLoading },
    dispatch,
  } = pluginContext();
  const [lastVerifiedKey, setLastVerifiedKey] = useState("");

  const [licenseKeyInputValue, setLicenseKeyInputValue] = useState("");

  const verifyKey = async () => {
    if (licenseKeyInputValue === lastVerifiedKey) {
      return;
    }

    if (debug.enabled) console.log("Verifying key");

    dispatch({ type: "SET_IS_LOADING", payload: true });

    const { success, message } = await verifyLicenseKey({
      licenseKey: licenseKeyInputValue,
    });

    if (debug.enabled) console.log("Key verified");

    dispatch({ type: "SET_IS_LOADING", payload: false });

    if (!success) {
      dispatch({ type: "SET_ERROR", payload: message });
      setLicenseKeyInputValue("");
      return;
    }

    dispatch({ type: "SET_ERROR", payload: "" });

    dispatch({ type: "SET_IS_NEW_USER", payload: false });
    dispatch({ type: "SET_LICENSE_KEY", payload: licenseKeyInputValue });
    setLastVerifiedKey(licenseKeyInputValue);
  };

  const lengthHit = licenseKeyInputValue.length === licenseKeyLength;

  useEffect(() => {
    if (lengthHit && licenseKeyInputValue !== lastVerifiedKey) {
      verifyKey();
    }
  }, [licenseKeyInputValue, lastVerifiedKey]);

  const signInForm = (
    <Stack space="small">
      <Stack space="extraSmall" style={{ width: 270 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text>Paste your license key</Text>
          <Link fullWidth href={getBaseUrl()} target="_blank">
            Need a key?
          </Link>
        </div>

        <Textbox
          spellCheck={false}
          variant="border"
          maxLength={licenseKeyLength}
          password={true}
          disabled={lengthHit || !isNewUser}
          value={licenseKeyInputValue}
          style={{
            backdropFilter: "blur(10px)",
            background: "rgba(255,255,255,0.6",
          }}
          onValueInput={(val: string) => {
            setLicenseKeyInputValue(val);
          }}
          icon={
            isLoading ? (
              <LoadingIndicator color="component" />
            ) : isNewUser ? (
              <IconLockLocked32 />
            ) : (
              <IconLockUnlocked32 color="success" />
            )
          }
          onFocusCapture={() => {
            dispatch({ type: "SET_ERROR", payload: "" });
          }}
        />
        {error && (
          <Banner icon={<IconWarning32 />} variant="warning">
            {error}
          </Banner>
        )}
      </Stack>
    </Stack>
  );

  return (
    <div className={styles.overlayContainer}>
      <MiddleAlign style={{ zIndex: 999 }}>
        <motion.div {...containerAnimation}>
          <motion.div
            variants={logoVariants}
            initial="hidden"
            animate="visible"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Logo isDarkMode={false} />
          </motion.div>
          <VerticalSpace space="extraLarge" />
          <div className={styles.logoType}>
            {" "}
            <motion.div {...staggerAnimation}>
              {"DIAGRAMMATON".split("").map((char, index) => (
                <motion.span
                  key={index}
                  {...letterAnimation}
                  variants={staggerAnimation.variants}
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
          </div>
          <motion.div
            variants={descriptionVariants}
            initial="hidden"
            animate="visible"
            className={styles.description}
          >
            AI powered diagrams for FigJam
          </motion.div>
        </motion.div>
        <motion.div
          variants={signInVariants}
          initial="hidden"
          animate="visible"
          onAnimationStart={() => {
            setTimeout(() => {
              document.querySelector("input")?.focus();
            }, 100);
          }}
        >
          {signInForm}
        </motion.div>
      </MiddleAlign>
      <motion.div
        {...arrowsAnimation}
        style={{
          position: "fixed",
          display: "flex",
          minHeight: "100vh",
          minWidth: "100vw",
          alignItems: "center",
          justifyContent: "center",
          zIndex: -1,
        }}
      >
        <StarArrows />
      </motion.div>
      <DiamondAnimation numDiamonds={DIAMONDS_NUM} />
    </div>
  );
}

export default SignIn;
