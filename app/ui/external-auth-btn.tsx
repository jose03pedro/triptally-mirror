type ExternalAuthBtnProps = {
  provider: "Google" | "Apple";
};

export function ExternalAuthBtn({ provider }: ExternalAuthBtnProps) {
  return (
    <button className="btn btn-outline-secondary w-100 position-relative">
      <img
        src={`/icons/${provider.toLowerCase()}.png`}
        alt={`${provider} logo`}
        width={18}
        className="position-absolute start-3 top-50 translate-middle-y"
      />

      <span className="d-block text-center w-100">
        Continue with {provider}
      </span>
    </button>
  );
}
