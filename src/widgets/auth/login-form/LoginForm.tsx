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
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div
        className="grid gap-1.5 motion-safe:animate-auth-fade-up"
        style={{ animationDelay: "180ms" }}
      >
        <div className="flex items-baseline justify-between gap-4 max-sm:flex-col max-sm:items-start">
          <label className="font-bold text-forest-900" htmlFor={identityId}>
            Identitas akun
          </label>
          <span className="text-[0.74rem] text-forest-900/50">
            NIS, username, atau email
          </span>
        </div>
        <div
          className={`flex min-h-[3.2rem] items-center gap-3 rounded-[1.1rem] border bg-[linear-gradient(180deg,rgba(251,253,252,1),rgba(243,247,244,0.96))] px-3 transition focus-within:-translate-y-px ${
            fieldErrors.identity
              ? "border-red-400/40 shadow-[0_0_0_4px_rgba(186,80,80,0.08)]"
              : "border-forest-700/12 focus-within:border-forest-700/22 focus-within:shadow-[0_0_0_4px_rgba(72,140,103,0.12)]"
          }`}
        >
          <span className="inline-flex min-h-[2.1rem] min-w-[2.1rem] items-center justify-center rounded-[0.85rem] bg-forest-700/8 text-[0.74rem] font-extrabold tracking-[0.08em] text-forest-700">
            ID
          </span>
          <input
            id={identityId}
            className="min-w-0 flex-1 border-none bg-transparent text-[0.92rem] text-forest-900 outline-none placeholder:text-forest-900/34"
            placeholder="Masukkan identitas akun"
            value={values.identity}
            onChange={(event) => handleChange("identity", event.target.value)}
            autoComplete="username"
          />
        </div>
        {fieldErrors.identity ? (
          <span className="text-[0.79rem] text-red-700">{fieldErrors.identity}</span>
        ) : null}
      </div>

      <div
        className="grid gap-1.5 motion-safe:animate-auth-fade-up"
        style={{ animationDelay: "260ms" }}
      >
        <div className="flex items-baseline justify-between gap-4 max-sm:flex-col max-sm:items-start">
          <label className="font-bold text-forest-900" htmlFor={passwordId}>
            Password
          </label>
          <span className="text-[0.74rem] text-forest-900/50">
            {isCapsLockOn ? "Caps Lock aktif" : "Gunakan password akun"}
          </span>
        </div>
        <div
          className={`flex min-h-[3.2rem] items-center gap-3 rounded-[1.1rem] border bg-[linear-gradient(180deg,rgba(251,253,252,1),rgba(243,247,244,0.96))] px-3 transition focus-within:-translate-y-px ${
            fieldErrors.password
              ? "border-red-400/40 shadow-[0_0_0_4px_rgba(186,80,80,0.08)]"
              : "border-forest-700/12 focus-within:border-forest-700/22 focus-within:shadow-[0_0_0_4px_rgba(72,140,103,0.12)]"
          }`}
        >
          <span className="inline-flex min-h-[2.1rem] min-w-[2.1rem] items-center justify-center rounded-[0.85rem] bg-forest-700/8 text-[0.74rem] font-extrabold tracking-[0.08em] text-forest-700">
            PW
          </span>
          <input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            className="min-w-0 flex-1 border-none bg-transparent text-[0.92rem] text-forest-900 outline-none placeholder:text-forest-900/34"
            placeholder="Masukkan password"
            value={values.password}
            onChange={(event) => handleChange("password", event.target.value)}
            onKeyDown={handlePasswordKeyboardState}
            onKeyUp={handlePasswordKeyboardState}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="rounded-full border border-forest-700/10 bg-forest-700/6 px-3 py-1.5 text-[0.72rem] font-bold text-forest-900/72 transition hover:-translate-y-px hover:border-forest-700/16 hover:bg-forest-700/10"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? "Sembunyikan" : "Lihat"}
          </button>
        </div>
        {fieldErrors.password ? (
          <span className="text-[0.79rem] text-red-700">{fieldErrors.password}</span>
        ) : null}
      </div>

      {errorMessage ? (
        <div
          className="rounded-2xl border border-red-400/20 bg-red-50 px-3.5 py-3 text-[0.78rem] leading-[1.45] text-red-700 motion-safe:animate-auth-fade-up"
          aria-live="polite"
          style={{ animationDelay: "320ms" }}
        >
          {errorMessage}
        </div>
      ) : null}

      <button
        className="mt-0.5 inline-flex min-h-[3.3rem] w-full items-center justify-center rounded-full border border-transparent bg-[linear-gradient(135deg,#174c34_0%,#2d7a56_100%)] px-5 py-3 font-bold text-white shadow-[0_18px_34px_rgba(16,53,37,0.24)] transition hover:-translate-y-px hover:shadow-[0_22px_40px_rgba(16,53,37,0.3)] disabled:cursor-wait motion-safe:animate-auth-fade-up"
        disabled={isSubmitting}
        style={{ animationDelay: "360ms" }}
      >
        {isSubmitting ? "Memproses..." : "Masuk"}
      </button>

      <p
        className="text-[0.74rem] leading-[1.46] text-forest-900/52 motion-safe:animate-auth-fade-up max-[700px]:hidden"
        style={{ animationDelay: "420ms" }}
      >
        Sesi login aktif akan disimpan otomatis setelah autentikasi berhasil.
      </p>
    </form>
  );
}
