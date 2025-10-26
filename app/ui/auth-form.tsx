type AuthFormProps = {
  submitType: string;
};

export default function AuthForm({ submitType }: AuthFormProps) {
  return (
    //<form action={signup}>
    <form>
      <header>
        <h2 className="h5 mb-1">Your smart travel planner.</h2>
        <h3 className="h5 text-secondary">
          {submitType} your TripTally account
        </h3>
      </header>
      <div className="my-3">
        <div className="mb-2">
          <label htmlFor="email" className="form-label text-secondary fs-7">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address..."
            className="form-control fs-6"
          />
        </div>
        <div>
          <label htmlFor="password" className="form-label text-secondary fs-7">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password..."
            className="form-control fs-6"
          />
        </div>
      </div>
      <button type="submit" className="btn btn-primary w-100">
        Continue
      </button>
    </form>
  );
}
