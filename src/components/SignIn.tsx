import { h } from "preact";
import {
  Banner,
  IconCheckCircle32,
  IconCheckCircleFilled32,
  IconLockLocked16,
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
import { AnimationProps } from "framer-motion";

import styles from "./styles.css";
import Logo from "./Logo";
import { pluginContext } from "./PluginContext";
import { verifyLicenseKey } from "../verifyLicenseKey";

import { AnimatePresence, MotionDiv, MotionSpan } from "./Motion";
import StarArrows from "./StarArrows";

const approxDiamondAnimLength = 2;

const diamondAnimation: AnimationProps = {
  initial: {
    opacity: 0,
    scale: 0.5,
    rotate: 45,
  },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 45,
    transition: { type: "spring", damping: 50, stiffness: 80 },
  },
};

const arrowsAnimation: AnimationProps = {
  initial: {
    opacity: 0,
    scale: 0.85,
  },
  animate: {
    opacity: 0.5,
    scale: 1,
    transition: { type: "spring", damping: 50, stiffness: 80 },
  },
};

const logoAnimation: AnimationProps = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 40,
      delay: 1.3,
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
        staggerChildren: 0.05,
        delayChildren: 1,
      },
    },
  },
};

const letterAnimation: AnimationProps = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { type: "spring", damping: 40, stiffness: 150 },
  },
};

const descriptionAnimation: AnimationProps = {
  initial: { opacity: 0, y: -15 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: approxDiamondAnimLength,
      type: "spring",
      damping: 20,
      stiffness: 100,
    },
  },
};

const containerAnimation: AnimationProps = {
  initial: { y: -4 },

  animate: {
    y: -35,
    transition: {
      delay: approxDiamondAnimLength + 2,
      type: "spring",
      damping: 16,
      stiffness: 160,
    },
  },
};
const signInAnimation: AnimationProps = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: -10,
    transition: {
      delay: approxDiamondAnimLength + 2.07,
      type: "spring",
      damping: 16,
      stiffness: 160,
    },
  },
};

const licenseKeyLength = 18;

function SignIn() {
  const {
    setLicenseKey,
    setError,
    isNewUser,
    setIsNewUser,
    error,
    setIsLoading,
    isLoading,
  } = pluginContext();
  const [lastVerifiedKey, setLastVerifiedKey] = useState("");

  const [licenseKeyInputValue, setLicenseKeyInputValue] = useState("");

  const verifyKey = async () => {
    if (licenseKeyInputValue === lastVerifiedKey) {
      return;
    }

    setIsLoading(true);

    const { success, message } = await verifyLicenseKey({
      licenseKey: licenseKeyInputValue,
    });

    setIsLoading(false);

    if (!success) {
      setError(message);
      setLicenseKeyInputValue("");
      return;
    }

    setError("");
    setLicenseKey(licenseKeyInputValue);
    setIsNewUser(false);
    setLastVerifiedKey(licenseKeyInputValue);
  };

  const lengthHit = licenseKeyInputValue.length === licenseKeyLength;

  if (lengthHit) {
    verifyKey();
  }

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
          <Link fullWidth href="https://diagrammaton.com" target="_blank">
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
            setError("");
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
    <div className={styles.blurContainer}>
      <MiddleAlign>
        <MotionDiv {...containerAnimation}>
          <MotionDiv
            {...logoAnimation}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Logo size={64} />
          </MotionDiv>
          <VerticalSpace space="extraLarge" />
          <div className={styles.logoType}>
            {" "}
            <MotionDiv {...staggerAnimation}>
              {"DIAGRAMMATON".split("").map((char, index) => (
                <MotionSpan
                  key={index}
                  {...letterAnimation}
                  variants={staggerAnimation.variants}
                >
                  {char}
                </MotionSpan>
              ))}
            </MotionDiv>
          </div>
          <MotionDiv {...descriptionAnimation} className={styles.description}>
            AI powered diagrams for FigJam
          </MotionDiv>
        </MotionDiv>
        <MotionDiv
          {...signInAnimation}
          onAnimationStart={() => {
            setTimeout(() => {
              document.querySelector("input")?.focus();
            }, 100);
          }}
        >
          {signInForm}
        </MotionDiv>
      </MiddleAlign>
      <MotionDiv
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
      </MotionDiv>
      <MotionDiv
        {...diamondAnimation}
        style={{
          borderRadius: "0.25rem",
          position: "fixed",
          height: "380px",
          left: "calc(50% - 190px)",
          top: "calc(50% - 190px)",
          width: "380px",
          transformOrigin: "center",
          transform: "rotate(45deg)",
          border: "1px solid #d1d5db",
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.8) 30%, rgba(255, 255, 255, 0.4) 100%)",
          zIndex: -1,
        }}
      />
    </div>
  );
}

export default SignIn;
