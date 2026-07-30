import { Kerangka } from "@/components/publik/Kerangka";

export default function PublikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Kerangka>{children}</Kerangka>;
}
