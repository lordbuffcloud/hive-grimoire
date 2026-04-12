import { notFound } from "next/navigation";
import spirits from "@/data/spirits.json";
import SpiritDetail from "@/components/SpiritDetail";
import type { Spirit } from "@/lib/types";
import type { Metadata } from "next";

const allSpirits = spirits as Spirit[];

export function generateStaticParams() {
  return allSpirits.map((spirit) => ({
    id: String(spirit.id),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const spirit = allSpirits.find((s) => s.id === Number(id));
  if (!spirit) return { title: "Spirit Not Found" };

  return {
    title: `${spirit.name} — Hive Grimoire`,
    description: spirit.description,
  };
}

export default async function SpiritPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const spirit = allSpirits.find((s) => s.id === Number(id));
  if (!spirit) notFound();

  return <SpiritDetail spirit={spirit} />;
}
