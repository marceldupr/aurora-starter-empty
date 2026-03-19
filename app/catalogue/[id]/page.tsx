import Link from "next/link";
import { notFound } from "next/navigation";
import { AuroraClient } from "@aurora-studio/sdk";

const baseUrl = process.env.NEXT_PUBLIC_AURORA_API_URL ?? "";
const apiKey = process.env.AURORA_API_KEY ?? "";
const tableSlug = process.env.NEXT_PUBLIC_CATALOG_TABLE ?? "products";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!baseUrl || !apiKey) notFound();

  const client = new AuroraClient({ baseUrl, apiKey });

  let record: Record<string, unknown>;
  try {
    record = await client.tables(tableSlug).records.get(id);
  } catch {
    notFound();
  }

  const displayField = ["name", "title", "slug"].find((f) => record[f]) ?? "id";
  const name = String(record[displayField] ?? record.id);
  const priceField = ["price", "amount", "value"].find((f) => record[f] != null);
  const priceCents = priceField ? Number(record[priceField]) : undefined;
  const imageField = ["image_url", "image", "thumbnail", "photo"].find((f) => record[f]);
  const imageUrl = imageField ? String(record[imageField]) : null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <Link href="/catalogue" className="text-slate-400 hover:text-white mb-6 inline-block">
        ← Back
      </Link>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="shrink-0 md:w-1/2">
          <div className="aspect-square rounded-lg bg-slate-800 overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-6xl">
                 - 
              </div>
            )}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-4">{name}</h1>
          {priceCents != null && (
            <p className="text-xl text-cyan-400 font-semibold mb-6">
              {new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency: "GBP",
              }).format(priceCents / 100)}
            </p>
          )}
          <section data-holmes="recommendations" className="mt-8 pt-8 border-t border-slate-700">
            <h2 className="text-lg font-semibold mb-2">You might also like</h2>
            <Link
              href="/catalogue"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View full catalogue →
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
