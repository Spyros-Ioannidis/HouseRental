import { Link } from "@inertiajs/react";

function AuthPageShell({
  title,
  subtitle,
  children,
  switchText,
  switchHref,
  switchLabel,highlights = [],
}) {
  return (
    <div className="min-h-[90vh] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl overflow-hidden border border-color-card rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
        <section className="p-6 sm:p-8 lg:p-12">


          <div className="mb-8">
            <h1 className="font-bold text-3xl">{title}</h1>
            <p className="mt-3 leading-6 text-gray-500 text-sm">{subtitle}</p>
          </div>

          {children}

          <div className="mb-3 mt-6 flex items-center justify-center gap-4 pt-3 border-gray-200 border-t">
            <div>
              <p className="mt-1 text-gray-500 text-sm">{switchText}
                {" "}
                <Link
                  href={switchHref}
                  className="text-indigo-700 underline underline-offset-4 transition-colors"
                >
                  {switchLabel}
                </Link>
                </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuthPageShell;
