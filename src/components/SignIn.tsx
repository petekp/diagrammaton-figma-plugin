import { h } from "preact";
import {
  Banner,
  IconCheckCircle32,
  IconLockLocked16,
  IconWarning32,
  Link,
  MiddleAlign,
  Stack,
  Text,
  Textbox,
} from "@create-figma-plugin/ui";
import { useState } from "preact/hooks";
import { AnimationProps } from "framer-motion";

import styles from "./styles.css";
import Logo from "./Logo";
import { pluginContext } from "./PluginContext";
import { verifyLicenseKey } from "../verifyLicenseKey";

import { MotionDiv, MotionSpan } from "./Motion";

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
        delayChildren: 1,
        staggerChildren: 0.05,
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

const licenseKeyLength = 18;

function SignIn() {
  const { setLicenseKey, setError, isNewUser, setIsNewUser, error } =
    pluginContext();
  const [lastVerifiedKey, setLastVerifiedKey] = useState("");

  const [licenseKeyInputValue, setLicenseKeyInputValue] = useState("");

  const verifyKey = async () => {
    if (licenseKeyInputValue === lastVerifiedKey) {
      return;
    }

    const { success, message } = await verifyLicenseKey({
      licenseKey: licenseKeyInputValue,
    });

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
          <Text>Please paste your license key</Text>
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
            isNewUser ? (
              <IconLockLocked16 />
            ) : (
              <IconCheckCircle32 color="success" />
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
        <Logo />
        <div className={styles.logoType}>
          {" "}
          <MotionDiv {...staggerAnimation}>
            {"Diagrammaton".split("").map((char, index) => (
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
      </MiddleAlign>
    </div>
  );
}

export default SignIn;
