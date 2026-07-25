import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { route } from "@/ziggy";
import GradientButton from "@/Components/form/Button/GradientButton";

export function CardProfile({auth}) {
  const [open, setOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    const initials = names.map((n) => n[0].toUpperCase());
    return initials.slice(0, 2).join("");
  };

  const logout = () => {
    router.post(route("logout"));
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="cursor-pointer">
        {auth.user ? (
          auth.user.profile_picture ? (
            <img
              src={auth.user.profile_picture}
              alt="profile"
              className="h-12 w-12 rounded-full bg-gray-300"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-400 font-semibold text-white">
              {getInitials(auth.user.name)}
            </div>
          )
        ) : (
          <HiOutlineUserCircle size={48} />
        )}
      </div>

      <div
        className={`absolute right-0 z-10 w-64 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="p-4 border border- border-color-card rounded-2xl bg-color-card shadow-[0_0_20px_rgba(0,0,0,0.40)]">
          {auth.user ? (
            <>
              {/* Auth User */}
              <div className="flex items-center gap-3">
                <div>
                  <span className="font-semibold text-color-primary">
                    {auth.user.name}
                  </span>
                </div>
              </div>

              <GradientButton
                className="mt-4 w-full"
                onClick={() => router.visit(route("dashboard"))}
              >
                Profile
              </GradientButton>

              <GradientButton
                className="mt-2 w-full"
                onClick={logout}
              >
                Logout
              </GradientButton>
            </>
          ) : (
            <>
              {/*  Guest */}
              <GradientButton
                className="mt-2 w-full"
                onClick={() => router.visit(route("login"))}
              >
                Sign In
              </GradientButton>

              <GradientButton
                className="mt-2 w-full"
                onClick={() => router.visit(route("register"))}
              >
                Register
              </GradientButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
