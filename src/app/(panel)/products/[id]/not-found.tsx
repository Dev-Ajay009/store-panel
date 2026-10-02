import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="card mx-auto max-w-md px-6 py-10 text-center">
      <h1 className="text-lg font-semibold">Product not found</h1>
      <p className="mt-2 text-sm text-gray-600">
        It may have been deleted, or the link is wrong.
      </p>
      <Link href="/products" className="btn btn-secondary mt-4">
        Back to products
      </Link>
    </div>
  );
}
