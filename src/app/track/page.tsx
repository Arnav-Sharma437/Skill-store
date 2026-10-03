import { redirect } from "next/navigation";

export default function TrackRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return redirect("/track-order");
}
