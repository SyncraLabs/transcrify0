import ecosystemData from "@/data/ecosystem.json";

export default function BuiltByBanner() {
  return (
    <div className="text-center py-4">
      <p className="text-neutral-600 text-xs">
        Built by{" "}
        <span className="text-neutral-400">
          {ecosystemData.author.name}
        </span>{" "}
        &mdash; {ecosystemData.author.role}
      </p>
    </div>
  );
}
