import { Skeleton } from "../../../shared/ui/skeleton";

export function NotesSkeleton() {
  const dummyCards = [
    { height: "h-56", items: 2 },
    { height: "h-72", items: 4 },
    { height: "h-64", items: 3 },
    { height: "h-80", items: 5 },
    { height: "h-60", items: 2 },
    { height: "h-68", items: 3 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
      {dummyCards.map((card, idx) => (
        <div
          key={idx}
          className="rounded-3xl p-6 bg-white/70 backdrop-blur-sm border-b-4 border-purple-100 shadow-md flex flex-col justify-between"
        >
          <div>
            {/* Top row badge */}
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="w-24 h-6 rounded-full bg-purple-200/50" />
              <Skeleton className="w-8 h-8 rounded-full bg-purple-100/60" />
            </div>

            {/* Note title */}
            <Skeleton className="w-4/5 h-6 rounded-xl bg-purple-200/60 mb-3" />

            {/* Content lines */}
            <div className="space-y-2 mb-4">
              <Skeleton className="w-full h-3.5 rounded-md bg-purple-100/70" />
              <Skeleton className="w-5/6 h-3.5 rounded-md bg-purple-100/70" />
              <Skeleton className="w-2/3 h-3.5 rounded-md bg-purple-100/70" />
            </div>

            {/* Checklist placeholders */}
            <div className="space-y-2 mt-4">
              {Array.from({ length: card.items }).map((_, itemIdx) => (
                <div key={itemIdx} className="flex items-center gap-2.5 px-2 py-1">
                  <Skeleton className="w-4 h-4 rounded-md bg-purple-200/50 flex-shrink-0" />
                  <Skeleton className="w-3/4 h-3.5 rounded bg-purple-100/60" />
                </div>
              ))}
            </div>
          </div>

          {/* Date footer */}
          <div className="pt-4 mt-2 border-t border-purple-100/60 flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded-full bg-purple-100/80" />
            <Skeleton className="w-24 h-3.5 rounded bg-purple-100/60" />
          </div>
        </div>
      ))}
    </div>
  );
}
