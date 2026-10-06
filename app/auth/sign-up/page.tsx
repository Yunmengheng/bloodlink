import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <div className="flex w-full items-center justify-center px-4 py-14 sm:py-20">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
