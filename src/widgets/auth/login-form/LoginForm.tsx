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

function IconUser() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}

function IconEyeOpen() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path
        fillRule="evenodd"
        d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41a1.651 1.651 0 0 1 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconEyeSlash() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path
        fillRule="evenodd"
        d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z"
        clipRule="evenodd"
      />
      <path d="M10.748 13.93l2.523 2.523a10.01 10.01 0 0 1-8.552-4.42.75.75 0 0 1 0-.857 9.998 9.998 0 0 1 1.287-1.558L10.748 13.93Z" />
    </svg>
  );
}

function IconCapsLock() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
      <path
        fillRule="evenodd"
        d="M10 1a.75.75 0 0 1 .55.24l5.25 5.5A.75.75 0 0 1 15.25 8H13v4.75a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75V8H4.75a.75.75 0 0 1-.55-1.26l5.25-5.5A.75.75 0 0 1 10 1Zm-2 15.5a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5h-4Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

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

  function handlePasswordKeyboardState(event: KeyboardEvent<HTMLInputElement>) {
    setIsCapsLockOn(event.getModifierState("CapsLock"));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Partial<LoginFormValues> = {};

    if (!values.identity.trim()) {
      nextErrors.identity = "Identitas akun wajib diisi.";
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
    <form className="grid gap-3.5" onSubmit={handleSubmit} noValidate>
      {/* Identity field */}
      <div
        className="grid gap-1.5 motion-safe:animate-auth-fade-up"
        style={{ animationDelay: "180ms" }}
      >
        <div className="flex items-baseline justify-between gap-4">
          <label className="text-[0.84rem] font-bold text-forest-900" htmlFor={identityId}>
            Identitas Akun
          </label>
          <span className="text-[0.72rem] text-forest-900/45">
            NIS, username, atau email
          </span>
        </div>
        <div
          className={`group flex min-h-[3.1rem] items-center gap-2.5 rounded-xl border bg-[linear-gradient(160deg,rgba(252,254,253,1),rgba(243,248,245,0.95))] px-3 transition-all duration-200 ${
            fieldErrors.identity
              ? "border-red-400/50 shadow-[0_0_0_3px_rgba(186,80,80,0.1)]"
              : "border-forest-700/14 focus-within:border-forest-600/40 focus-within:shadow-[0_0_0_3px_rgba(45,122,86,0.1)] hover:border-forest-700/22"
          }`}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
              fieldErrors.identity
                ? "bg-red-50 text-red-500"
                : "bg-forest-700/7 text-forest-700/60 group-focus-within:bg-forest-600/12 group-focus-within:text-forest-600"
            }`}
          >
            <IconUser />
          </span>
          <input
            id={identityId}
            className="min-w-0 flex-1 border-none bg-transparent text-[0.9rem] text-forest-900 outline-none placeholder:text-forest-900/30"
            placeholder="Masukkan identitas akun"
            value={values.identity}
            onChange={(event) => handleChange("identity", event.target.value)}
            autoComplete="username"
          />
        </div>
        {fieldErrors.identity ? (
          <span className="flex items-center gap-1 text-[0.76rem] text-red-600">
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 shrink-0">
              <path
                fillRule="evenodd"
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm0-9.75a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75ZM8 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"
                clipRule="evenodd"
              />
            </svg>
            {fieldErrors.identity}
          </span>
        ) : null}
      </div>

      {/* Password field */}
      <div
        className="grid gap-1.5 motion-safe:animate-auth-fade-up"
        style={{ animationDelay: "260ms" }}
      >
        <div className="flex items-baseline justify-between gap-4">
          <label className="text-[0.84rem] font-bold text-forest-900" htmlFor={passwordId}>
            Password
          </label>
          {isCapsLockOn ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-50 px-2 py-0.5 text-[0.7rem] font-semibold text-amber-700">
              <IconCapsLock />
              Caps Lock aktif
            </span>
          ) : (
            <span className="text-[0.72rem] text-forest-900/45">Gunakan password akun</span>
          )}
        </div>
        <div
          className={`group flex min-h-[3.1rem] items-center gap-2.5 rounded-xl border bg-[linear-gradient(160deg,rgba(252,254,253,1),rgba(243,248,245,0.95))] px-3 transition-all duration-200 ${
            fieldErrors.password
              ? "border-red-400/50 shadow-[0_0_0_3px_rgba(186,80,80,0.1)]"
              : "border-forest-700/14 focus-within:border-forest-600/40 focus-within:shadow-[0_0_0_3px_rgba(45,122,86,0.1)] hover:border-forest-700/22"
          }`}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
              fieldErrors.password
                ? "bg-red-50 text-red-500"
                : "bg-forest-700/7 text-forest-700/60 group-focus-within:bg-forest-600/12 group-focus-within:text-forest-600"
            }`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            className="min-w-0 flex-1 border-none bg-transparent text-[0.9rem] text-forest-900 outline-none placeholder:text-forest-900/30"
            placeholder="Masukkan password"
            value={values.password}
            onChange={(event) => handleChange("password", event.target.value)}
            onKeyDown={handlePasswordKeyboardState}
            onKeyUp={handlePasswordKeyboardState}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-forest-700/10 bg-forest-700/5 text-forest-700/50 transition-all duration-150 hover:border-forest-700/20 hover:bg-forest-700/10 hover:text-forest-700/80 active:scale-90"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? <IconEyeSlash /> : <IconEyeOpen />}
          </button>
        </div>
        {fieldErrors.password ? (
          <span className="flex items-center gap-1 text-[0.76rem] text-red-600">
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 shrink-0">
              <path
                fillRule="evenodd"
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm0-9.75a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75ZM8 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"
                clipRule="evenodd"
              />
            </svg>
            {fieldErrors.password}
          </span>
        ) : null}
      </div>

      {/* Error banner */}
      {errorMessage ? (
        <div
          className="flex items-start gap-2.5 rounded-xl border border-red-400/20 bg-red-50 px-3.5 py-3 text-[0.8rem] leading-normal text-red-700 motion-safe:animate-auth-fade-up"
          aria-live="polite"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="mt-px h-4 w-4 shrink-0 text-red-500">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clipRule="evenodd"
            />
          </svg>
          {errorMessage}
        </div>
      ) : null}

      {/* Submit button */}
      <button
        type="submit"
        className="relative mt-1 inline-flex min-h-[3.1rem] w-full items-center justify-center overflow-hidden rounded-xl border border-transparent bg-[linear-gradient(135deg,#174c34_0%,#2d7a56_100%)] px-5 py-3 text-[0.9rem] font-bold text-white shadow-[0_16px_32px_rgba(16,53,37,0.22)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_20px_40px_rgba(16,53,37,0.3)] active:translate-y-0 active:shadow-[0_8px_20px_rgba(16,53,37,0.2)] disabled:cursor-wait disabled:opacity-80 motion-safe:animate-auth-fade-up"
        disabled={isSubmitting}
        style={{ animationDelay: "360ms" }}
      >
        {/* Shimmer */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] transition-transform duration-700 hover:translate-x-full" aria-hidden="true" />

        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="h-4 w-4 motion-safe:animate-auth-spin"
            >
              <path
                d="M10 3.5a6.5 6.5 0 1 0 6.5 6.5"
                strokeLinecap="round"
              />
            </svg>
            Memproses...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Masuk
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5">
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </button>

      <p
        className="text-center text-[0.72rem] leading-normal text-forest-900/40 motion-safe:animate-auth-fade-up max-[700px]:hidden"
        style={{ animationDelay: "420ms" }}
      >
        Sesi login aktif tersimpan otomatis setelah autentikasi berhasil.
      </p>
    </form>
  );
}

