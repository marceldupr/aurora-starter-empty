/**
 * Drop-in Catalog list for Aurora storefronts.
 * Fetches products from Aurora API via SDK.
 */

import Link from "next/link";
import { AuroraClient } from "@aurora-studio/sdk";

const baseUrl = process.env.NEXT_PUBLIC_AURORA_API_URL ?? "";
const apiKey = process.env.AURORA_API_KEY ?? "";

function createClient(): AuroraClient {
  return new AuroraClient({ baseUrl, apiKey });
}

function getImageUrl(record: Record<string, unknown>): string | null {
  const field = ["image_url", "image", "thumbnail", "photo"].find((f) => record[f]);
  return field ? String(record[field]) : null;
}

function getPrice(record: Record<string, unknown>): number | undefined {
  const field = ["price", "amount", "value"].find((f) => record[f] != null);
  return field ? Number(record[field]) : undefined;
}

function getDisplayName(record: Record<string, unknown>): string {
  const field = ["name", "title", "slug"].find((f) => record[f]) ?? "id";
  return String(record[field] ?? record.id ?? "");
}

function formatPrice(cents: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

interface CatalogListProps {
  tableSlug: string;
  title?: string;
  limit?: number;
  basePath?: string;
}

export async function CatalogList({
  tableSlug,
  title = "Products",
  limit = 12,
  basePath = "/catalogue",
}: CatalogListProps) {
  if (!baseUrl || !apiKey) {
    return (
      <section className="py-10 px-6">
        <p className="text-slate-400">Configure AURORA_API_URL and AURORA_API_KEY.</p>
      </section>
    );
  }

  const client = createClient();
  let records: Record<string, unknown>[] = [];
  let currency = "GBP";

  try {
    const config = await client.store.config();
    currency = (config as { currency?: string }).currency ?? "GBP";
    const result = await client.tables(tableSlug).records.list({
      limit,
      sort: "created_at",
      order: "desc",
    });
    records = result.data ?? [];
  } catch {
    return (
      <section className="py-10 px-6">
        <p className="text-slate-400">Unable to load products.</p>
      </section>
    );
  }

  return (
    <section className="py-10 px-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {records.map((record) => {
          const id = String(record.id ?? "");
          const name = getDisplayName(record);
          const priceCents = getPrice(record);
          const imageUrl = getImageUrl(record);

          return (
            <Link
              key={id}
              href={`${basePath}/${id}`}
              className="group p-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition-colors"
            >
              <div className="aspect-square rounded-lg bg-slate-700 mb-3 overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                     - 
                  </div>
                )}
              </div>
              <p className="font-medium truncate group-hover:text-cyan-400">{name}</p>
              {priceCents != null && (
                <p className="text-sm text-cyan-400 mt-1">{formatPrice(priceCents, currency)}</p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
