import { h } from "preact";
import styles from "./styles.css";
import Logo from "./Logo";
import {
  Banner,
  Bold,
  Button,
  Columns,
  Container,
  Divider,
  IconCheckCircle32,
  IconLockLocked16,
  IconWarning32,
  Inline,
  Link,
  MiddleAlign,
  Stack,
  Text,
  Textbox,
  VerticalSpace,
  useInitialFocus,
} from "@create-figma-plugin/ui";
import { pluginContext } from "./PluginContext";
import { verifyLicenseKey } from "../verifyLicenseKey";
import { useState } from "preact/hooks";

const licenseKeyLength = 18;

function SignIn() {
  const { setLicenseKey, setError, isNewUser, setIsNewUser, error } =
    pluginContext();
  const [lastVerifiedKey, setLastVerifiedKey] = useState("");

  const [licenseKeyInputValue, setLicenseKeyInputValue] = useState("");
  const initialFocus = useInitialFocus();

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

  return (
    <div className={styles.blurContainer}>
      <MiddleAlign>
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
              {...initialFocus}
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
      </MiddleAlign>
    </div>
  );
}

export default SignIn;
