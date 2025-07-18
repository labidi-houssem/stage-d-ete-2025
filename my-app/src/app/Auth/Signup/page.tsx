import Signup from "@/components/Auth/Signup";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <Breadcrumb pageName="Sign Up" />

        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="flex flex-wrap items-stretch">
            <div className="w-full xl:w-1/2">
              <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
                <Signup />
              </div>
            </div>

            <div className="hidden w-full xl:block xl:w-1/2">
              <div className="custom-gradient-1 overflow-hidden rounded-2xl px-12.5 pt-12.5 pb-12.5 h-full dark:!bg-dark-2 dark:bg-none">
                <Link className="mb-10 inline-block" href="/">
                  <Image
                    className="hidden dark:block"
                    src={"/images/logo/logo.jpg"}
                    alt="Logo"
                    width={176}
                    height={32}
                  />
                  <Image
                    className="dark:hidden"
                    src={"/images/logo/logo.jpg"}
                    alt="Logo"
                    width={176}
                    height={32}
                  />
                </Link>
                <p className="mb-3 text-xl font-medium text-dark dark:text-white">
                  Create your account
                </p>

                <h1 className="mb-4 text-2xl font-bold text-dark dark:text-white sm:text-heading-3">
                  Join Us Today!
                </h1>

                <p className="w-full max-w-[375px] font-medium text-dark-4 dark:text-dark-6">
                  Please create your account by completing the necessary
                  fields below
                </p>

                <div className="mt-16">
                  <Image
                    src={"/images/grids/grid-02.svg"}
                    alt="Grid"
                    width={405}
                    height={325}
                    className="mx-auto dark:opacity-30"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}