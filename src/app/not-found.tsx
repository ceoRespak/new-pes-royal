import Link from "next/link";
import { FaArrowRight, FaSearch } from "react-icons/fa";

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] items-center bg-light/60 pt-24">
      <div className="container-px py-20 text-center">
        <p className="font-display text-[6rem] font-extrabold leading-none text-primary/15 md:text-[10rem]">
          404
        </p>
        <h1 className="font-display -mt-6 text-3xl font-bold text-primary md:text-4xl">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="btn-primary group">
            <FaSearch /> Back to Home
            <FaArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/products" className="btn-outline">
            Browse Products
          </Link>
        </div>
      </div>
    </section>
  );
}
