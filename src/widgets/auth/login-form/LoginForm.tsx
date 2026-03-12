import { useId, useState, type FormEvent, type KeyboardEvent } from "react";

type LoginFormValues = {
  identity: string;
  password: string;
};

type LoginFormProps = {
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (values: LoginFormValues) => Promise<void>;
};

export function LoginForm({
  isSubmitting,
  errorMessage,
  onSubmit,
}: LoginFormProps) {
  const identityId = useId();
  const passwordId = useId();
  const [values, setValues] = useState<LoginFormValues>({
    identity: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginFormValues>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  function handleChange<K extends keyof LoginFormValues>(
    key: K,
    value: LoginFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handlePasswordKeyboardState(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    setIsCapsLockOn(event.getModifierState("CapsLock"));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Partial<LoginFormValues> = {};

    if (!values.identity.trim()) {
      nextErrors.identity = "Identity wajib diisi.";
    }

    if (!values.password.trim()) {
      nextErrors.password = "Password wajib diisi.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      identity: values.identity.trim(),
      password: values.password,
    });
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className={`form-field ${fieldErrors.identity ? "form-field--invalid" : ""}`}>
        <div className="form-field__top">
          <label className="form-field__label" htmlFor={identityId}>
            Identitas akun
          </label>
          <span className="form-field__meta">NIS, username, atau email</span>
        </div>
        <div className="form-field__control">
          <span className="form-field__prefix">ID</span>
          <input
            id={identityId}
            className="form-field__input"
            placeholder="Masukkan identitas akun"
            value={values.identity}
            onChange={(event) => handleChange("identity", event.target.value)}
            autoComplete="username"
          />
        </div>
        {fieldErrors.identity ? (
          <span className="form-field__error">{fieldErrors.identity}</span>
        ) : null}
      </div>

      <div className={`form-field ${fieldErrors.password ? "form-field--invalid" : ""}`}>
        <div className="form-field__top">
          <label className="form-field__label" htmlFor={passwordId}>
            Password
          </label>
          <span className="form-field__meta">
            {isCapsLockOn ? "Caps Lock aktif" : "Gunakan password akun"}
          </span>
        </div>
        <div className="form-field__control">
          <span className="form-field__prefix">PW</span>
          <input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            className="form-field__input"
            placeholder="Masukkan password"
            value={values.password}
            onChange={(event) => handleChange("password", event.target.value)}
            onKeyDown={handlePasswordKeyboardState}
            onKeyUp={handlePasswordKeyboardState}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="form-field__toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? "Sembunyikan" : "Lihat"}
          </button>
        </div>
        {fieldErrors.password ? (
          <span className="form-field__error">{fieldErrors.password}</span>
        ) : null}
      </div>

      {errorMessage ? <div className="form-alert">{errorMessage}</div> : null}

      <button
        className="button button--primary login-form__submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Memproses..." : "Masuk"}
      </button>

      <p className="login-form__support">
        Sistem akan menyimpan sesi login aktif dan memuat profil user setelah
        autentikasi berhasil.
      </p>
    </form>
  );
}
