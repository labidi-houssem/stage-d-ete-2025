import Link from "next/link";
import GoogleSigninButton from "../GoogleSigninButton";
import SigninWithPassword from "../SigninWithPassword";

export default function Signin() {
  return (
    <>
      <GoogleSigninButton text="Sign in" />

      <div className="my-6 flex items-center justify-center">
        <span className="block h-px w-full bg-gray-200"></span>
        <div className="block w-full min-w-fit bg-white px-3 text-center font-medium text-gray-500">
          Or sign in with email
        </div>
        <span className="block h-px w-full bg-gray-200"></span>
      </div>

      <div>
        <SigninWithPassword />
      </div>

      
    </>
  );
}
