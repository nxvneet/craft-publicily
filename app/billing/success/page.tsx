import Link from "next/link";

export default function BillingSuccess({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  return <Inner searchParams={searchParams} />;
}

async function Inner({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  return (
    <main className="grid min-h-[100svh] place-items-center px-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full bg-acid text-3xl text-ink">
          ✓
        </div>
        <h1 className="text-4xl font-medium tracking-tight md:text-5xl">You&apos;re on {plan ?? "your new plan"}.</h1>
        <p className="mt-3 text-cream-dim">
          Your subscription is active. Watermarks are off and your site limit just went up.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/create" className="rounded-full bg-acid px-6 py-3 text-sm font-semibold text-ink" data-cursor="hover">
            Build something →
          </Link>
          <Link href="/dashboard" className="hairline rounded-full px-6 py-3 text-sm" data-cursor="hover">
            My sites
          </Link>
        </div>
      </div>
    </main>
  );
}
