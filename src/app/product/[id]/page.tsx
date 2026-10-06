import React from "react";
import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const rawId = resolved?.id || "";
  const id = decodeURIComponent(rawId).trim();

  return {
    title: id ? `${id.toUpperCase()} - Skill Store` : "Product Details - Skill Store",
    description: "Shop high quality tools and industrial supplies on Skill Store.",
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  const rawId = resolved?.id || "";
  const id = decodeURIComponent(rawId).trim();

  return <ProductDetailClient initialId={id} />;
}
